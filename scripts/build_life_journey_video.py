"""
Generate a commercial-style life-journey intro video (real motion clips)
using Replicate wan-2.2-i2v-fast from still keyframes, then ffmpeg assemble.
"""
from __future__ import annotations

import os
import sys
import time
import urllib.request
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(r"C:\GitHub\04-02. eruso_eternal_memory\backend")
ASSETS = Path(r"C:\Users\user\.cursor\projects\c-GitHub-04-02-eruso-eternal-memory\assets")
HOME_IMG = Path(r"C:\GitHub\01-02. eruso_homepage_v1.0-main-eternal\images")
WORK = HOME_IMG / "life-video-build-ea"
OUT = HOME_IMG / "life-journey.mp4"

load_dotenv(ROOT / ".env")

SCENES = [
    {
        "file": "life-ea-01-birth.png",
        "prompt": (
            "Cinematic commercial advertisement shot of East Asian Korean family, "
            "gentle handheld camera slowly dollying in, soft warm dawn light, "
            "newborn East Asian baby feet held tenderly, subtle natural motion, "
            "shallow depth of field, emotional premium brand film, photorealistic, no text"
        ),
    },
    {
        "file": "life-ea-02-child.png",
        "prompt": (
            "Cinematic commercial advertisement shot, tracking camera follows an East Asian Korean child "
            "running joyfully through a sunlit meadow, hair and grass moving in the wind, warm golden hour, "
            "premium lifestyle film look, photorealistic motion, no text"
        ),
    },
    {
        "file": "life-ea-03-youth.png",
        "prompt": (
            "Cinematic commercial advertisement shot, slow lateral tracking of East Asian Korean young adults "
            "walking together on a quiet path at golden hour, natural gait and clothing movement, "
            "hopeful warm light, premium brand film, photorealistic, no text"
        ),
    },
    {
        "file": "life-ea-04-family.png",
        "prompt": (
            "Cinematic commercial advertisement shot, intimate East Asian Korean family dinner with soft camera drift, "
            "candle and warm indoor light flicker, subtle gestures of sharing and care, "
            "emotional premium film, photorealistic motion, no text"
        ),
    },
    {
        "file": "life-ea-05-elder.png",
        "prompt": (
            "Cinematic commercial advertisement shot, elderly East Asian Korean person by a window, slow push-in, "
            "soft afternoon light shifting, quiet breathing and page turn motion, "
            "peaceful contemplative premium film, photorealistic, no text"
        ),
    },
    {
        "file": "life-ea-06-farewell.png",
        "prompt": (
            "Cinematic commercial advertisement shot, Korean memorial farewell atmosphere, "
            "slow camera drift across white chrysanthemums and candle flame with rising incense smoke, "
            "serene remembrance mood, premium film, photorealistic, no text"
        ),
    },
]


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "eruso-life-intro/1.0"})
    with urllib.request.urlopen(req, timeout=180) as resp, open(dest, "wb") as f:
        f.write(resp.read())


def main() -> int:
    import replicate
    import subprocess

    token = os.environ.get("REPLICATE_API_TOKEN") or os.environ.get("REPLICATE_TOKEN")
    if not token:
        print("MISSING_TOKEN")
        return 1

    WORK.mkdir(parents=True, exist_ok=True)
    client = replicate.Client(api_token=token, timeout=600.0)
    clip_paths: list[Path] = []

    for i, scene in enumerate(SCENES, start=1):
        src = ASSETS / scene["file"]
        if not src.exists():
            print(f"MISSING_IMAGE {src}")
            return 1
        clip = WORK / f"clip-{i:02d}.mp4"
        if clip.exists() and clip.stat().st_size > 50_000:
            print(f"SKIP existing {clip.name}")
            clip_paths.append(clip)
            continue

        print(f"GEN {i}/6 {scene['file']} ...")
        t0 = time.time()
        output = None
        last_err = None
        for attempt in range(1, 4):
            try:
                with open(src, "rb") as image_file:
                    output = client.run(
                        "wan-video/wan-2.2-i2v-fast",
                        input={
                            "image": image_file,
                            "prompt": scene["prompt"],
                            "go_fast": True,
                            "num_frames": 81,
                            "frames_per_second": 16,
                            "resolution": "720p",
                            "interpolate_output": True,
                            "disable_safety_checker": False,
                        },
                    )
                last_err = None
                break
            except Exception as e:
                last_err = e
                print(f"  attempt {attempt}/3 failed: {type(e).__name__}: {e}")
                time.sleep(5 * attempt)
        if last_err is not None:
            raise last_err
        # output may be FileOutput / URL string / list
        url = None
        if isinstance(output, list) and output:
            output = output[0]
        if hasattr(output, "url"):
            url = output.url
        elif isinstance(output, str):
            url = url if False else output
        else:
            url = str(output)
        print(f"  got url in {time.time()-t0:.1f}s -> {str(url)[:80]}...")
        download(url, clip)
        print(f"  saved {clip.name} ({clip.stat().st_size} bytes)")
        clip_paths.append(clip)

    if len(clip_paths) != 6:
        print("CLIP_COUNT_FAIL", len(clip_paths))
        return 1

    # Normalize each clip to 1920x1080 30fps, then xfade chain
    norm_paths = []
    for i, clip in enumerate(clip_paths, start=1):
        norm = WORK / f"norm-{i:02d}.mp4"
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(clip),
                "-vf", "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p",
                "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                str(norm),
            ],
            check=True,
            capture_output=True,
        )
        norm_paths.append(norm)
        print(f"NORM {norm.name}")

    # Build xfade filter across 6 clips (0.5s crossfade)
    # duration of each ~ 81/16 ~= 5.06s; after 30fps interpolate similar
    # Use concat with short overlaps via xfade
    # Probe durations
    durs = []
    for p in norm_paths:
        probe = subprocess.run(
            [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", str(p),
            ],
            capture_output=True, text=True, check=True,
        )
        durs.append(float(probe.stdout.strip()))
    print("DURS", durs)

    fade = 0.55
    inputs = []
    for p in norm_paths:
        inputs.extend(["-i", str(p)])

    # xfade chain
    filter_parts = []
    offset = durs[0] - fade
    filter_parts.append(
        f"[0:v][1:v]xfade=transition=fade:duration={fade}:offset={max(offset, 0.1):.3f}[v1]"
    )
    prev = "v1"
    running = durs[0] + durs[1] - fade
    for i in range(2, 6):
        offset = running - fade
        label = "vout" if i == 5 else f"v{i}"
        filter_parts.append(
            f"[{prev}][{i}:v]xfade=transition=fade:duration={fade}:offset={max(offset, 0.1):.3f}[{label}]"
        )
        running = running + durs[i] - fade
        prev = label

    fc = ";".join(filter_parts)
    tmp = WORK / "assembled.mp4"
    cmd = [
        "ffmpeg", "-y", *inputs,
        "-filter_complex", fc,
        "-map", "[vout]",
        "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-movflags", "+faststart",
        str(tmp),
    ]
    print("FFMPEG assemble...")
    print(fc)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-2000:])
        # fallback: simple concat demuxer
        lst = WORK / "list.txt"
        lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in norm_paths), encoding="utf-8")
        subprocess.run(
            [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                "-movflags", "+faststart", str(tmp),
            ],
            check=True,
        )

    # Slightly speed up to ~18-22s commercial length if too long
    probe = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(tmp),
        ],
        capture_output=True, text=True, check=True,
    )
    dur = float(probe.stdout.strip())
    print("ASSEMBLED_DUR", dur)
    if dur > 22:
        speed = dur / 20.0
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(tmp),
                "-filter:v", f"setpts={1/speed:.4f}*PTS",
                "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                "-movflags", "+faststart", str(OUT),
            ],
            check=True,
        )
    else:
        OUT.write_bytes(tmp.read_bytes())

    print("OUT", OUT, OUT.stat().st_size)
    return 0


if __name__ == "__main__":
    sys.exit(main())
