"""
이루소 업무 흐름 영상 가이드 (다국어 · 어르신용)
- 실제 화면 캡처 + 큰 URL 표기 + 따라하기 단계
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

HOME = Path(__file__).resolve().parents[1]
BASE_DIR = HOME / "images" / "workflow-guide"
SCREEN_DIR = BASE_DIR / "screens"
FFMPEG = Path(
    r"C:\Users\user\AppData\Local\Microsoft\WinGet\Packages"
    r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
)
FFPROBE = FFMPEG.with_name("ffprobe.exe")
EDGE_TTS = shutil.which("edge-tts")
RATE = "-8%"
PAD_AFTER_SEC = 0.7
MIN_SLIDE_SEC = 5.0
W, H = 1920, 1080

NAVY = (31, 53, 86)
CREAM = (247, 241, 230)
GOLD = (200, 166, 91)
MUTED = (70, 84, 100)
TEAL = (23, 108, 104)
WHITE = (255, 255, 255)
SOFT = (236, 242, 246)
URL_BG = (255, 248, 230)
RED = (180, 60, 50)

FONTS = {
    "ko": {
        "reg": Path(r"C:\Windows\Fonts\malgun.ttf"),
        "bold": Path(r"C:\Windows\Fonts\malgunbd.ttf"),
        "wrap": "char",
    },
    "en": {
        "reg": Path(r"C:\Windows\Fonts\arial.ttf"),
        "bold": Path(r"C:\Windows\Fonts\arialbd.ttf"),
        "wrap": "word",
    },
    "zh": {
        "reg": Path(r"C:\Windows\Fonts\msyh.ttc"),
        "bold": Path(r"C:\Windows\Fonts\msyhbd.ttc"),
        "wrap": "char",
        "index": 0,
    },
    "ja": {
        "reg": Path(r"C:\Windows\Fonts\YuGothM.ttc"),
        "bold": Path(r"C:\Windows\Fonts\YuGothB.ttc"),
        "wrap": "char",
        "index": 0,
    },
    "hi": {
        "reg": Path(r"C:\Windows\Fonts\Nirmala.ttf"),
        "bold": Path(r"C:\Windows\Fonts\NirmalaB.ttf"),
        "wrap": "word",
    },
}

VOICES = {
    "ko": "ko-KR-SunHiNeural",
    "en": "en-US-JennyNeural",
    "zh": "zh-CN-XiaoxiaoNeural",
    "ja": "ja-JP-NanamiNeural",
    "hi": "hi-IN-SwaraNeural",
}

URLS = {
    "home": "https://erum2026.co.kr",
    "signup": "https://erum2026.co.kr/signup",
    "login": "https://erum2026.co.kr/login",
    "jesa": "https://erum2026.co.kr/service-select?mode=trial",
    "pricing": "https://erum2026.co.kr/pricing",
}

# screen file keys under SCREEN_DIR
SCREENS = {
    "home": "homepage-hero.png",
    "signup": "signup.png",
    "login": "login.png",
    "jesa": "jesa-trial.png",
    "kiosk": "local-kiosk.png",
    "apply": "homepage-full.png",
    "naver": "__compose_naver__",
}

SEARCH_KEYWORD = "이루소 추모서비스"


def load_font(lang: str, size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    conf = FONTS[lang]
    path = conf["bold"] if bold and conf["bold"].exists() else conf["reg"]
    index = conf.get("index", 0)
    try:
        return ImageFont.truetype(str(path), size, index=index)
    except OSError:
        return ImageFont.truetype(str(path), size)


def wrap_lines(draw, text: str, font_obj, max_width: int, wrap_mode: str) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        if not paragraph:
            lines.append("")
            continue
        if wrap_mode == "word":
            tokens = paragraph.split(" ")
            line = ""
            for tok in tokens:
                piece = tok if not line else f"{line} {tok}"
                if draw.textlength(piece, font=font_obj) <= max_width:
                    line = piece
                else:
                    if line:
                        lines.append(line)
                    line = tok
            if line:
                lines.append(line)
        else:
            line = ""
            for ch in paragraph:
                test = line + ch
                if draw.textlength(test, font=font_obj) <= max_width:
                    line = test
                else:
                    lines.append(line)
                    line = ch
            if line:
                lines.append(line)
    return lines


def make_naver_search_mock(size: tuple[int, int]) -> Image.Image:
    """Elderly-friendly Naver search → result click mock."""
    w, h = size
    img = Image.new("RGB", (w, h), WHITE)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, w, 72), fill=(3, 199, 90))
    d.text((24, 18), "NAVER", font=load_font("en", 32, True), fill=WHITE)
    d.rounded_rectangle((24, 96, w - 24, 168), radius=14, fill=SOFT, outline=(3, 199, 90), width=3)
    d.text((44, 116), SEARCH_KEYWORD, font=load_font("ko", 34, True), fill=NAVY)
    d.rounded_rectangle((w - 150, 108, w - 40, 156), radius=10, fill=(3, 199, 90))
    d.text((w - 128, 118), "검색", font=load_font("ko", 26, True), fill=WHITE)
    d.rounded_rectangle((24, 200, w - 24, 420), radius=16, fill=(255, 250, 235), outline=GOLD, width=4)
    d.text((48, 220), "누르세요 ↓", font=load_font("ko", 24, True), fill=RED)
    d.text((48, 260), "이루소 온라인 디지털 추모관", font=load_font("ko", 34, True), fill=NAVY)
    d.text((48, 320), "추모관 · 앱 · 온라인 제사당 서비스", font=load_font("ko", 26, False), fill=MUTED)
    d.text((48, 365), "공식 서비스 바로가기", font=load_font("ko", 24, True), fill=TEAL)
    d.text((48, 460), "검색 결과에서 ‘이루소’가 보이면 눌러 주세요.", font=load_font("ko", 24, False), fill=MUTED)
    d.text((48, 510), "자녀분이 보낸 링크가 있으면 그 링크를 눌러도 됩니다.", font=load_font("ko", 22, False), fill=MUTED)
    return img


def paste_screen(canvas: Image.Image, screen_key: str, box: tuple[int, int, int, int], browser_title: str) -> None:
    """Draw browser chrome + screenshot inside box (x,y,w,h)."""
    x, y, bw, bh = box
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((x, y, x + bw, y + bh), radius=18, fill=(45, 55, 70))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse((x + 18 + i * 22, y + 14, x + 30 + i * 22, y + 26), fill=c)
    bar_y = y + 40
    draw.rounded_rectangle((x + 14, bar_y, x + bw - 14, bar_y + 44), radius=10, fill=WHITE)
    title = (browser_title or "이루소")[:40]
    title_font = load_font("ko", 22, True)
    draw.text((x + 28, bar_y + 10), title, font=title_font, fill=NAVY)

    content_top = bar_y + 56
    content_h = y + bh - content_top - 12
    content_w = bw - 24
    if screen_key == "naver":
        canvas.paste(make_naver_search_mock((content_w, content_h)), (x + 12, content_top))
        return

    path = SCREEN_DIR / SCREENS.get(screen_key, "")
    if path.exists() and path.stat().st_size > 50000:
        shot = Image.open(path).convert("RGB")
        fitted = ImageOps.fit(shot, (content_w, content_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.15))
        canvas.paste(fitted, (x + 12, content_top))
    else:
        draw.rectangle((x + 12, content_top, x + bw - 12, y + bh - 12), fill=SOFT)
        draw.text((x + 40, content_top + 40), "화면 준비 중", font=load_font("ko", 36, True), fill=MUTED)


def render_guide_slide(lang: str, idx: int, slide: dict, out_dir: Path) -> Path:
    wrap = FONTS[lang]["wrap"]
    img = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # left navy rail
    draw.rectangle((0, 0, 18, H), fill=NAVY)
    draw.rectangle((18, 0, 24, H), fill=GOLD)

    # header
    draw.rectangle((0, 0, W, 110), fill=NAVY)
    draw.text((48, 28), slide.get("eyebrow", ""), font=load_font(lang, 28, True), fill=GOLD)
    if slide.get("step"):
        draw.text((1680, 34), slide["step"], font=load_font("en", 28, True), fill=CREAM)

    # title
    title_font = load_font(lang, 54 if lang in {"en", "hi"} else 58, True)
    y = 140
    for line in slide["title"].split("\n"):
        draw.text((48, y), line, font=title_font, fill=NAVY)
        y += 66

    # left how-to panel
    panel_x, panel_y = 48, y + 10
    panel_w = 760
    draw.rounded_rectangle((panel_x, panel_y, panel_x + panel_w, 880), radius=20, fill=WHITE)
    draw.text((panel_x + 28, panel_y + 24), slide.get("howto_title", ""), font=load_font(lang, 30, True), fill=TEAL)

    how_font = load_font(lang, 28 if lang in {"en", "hi"} else 30, False)
    hy = panel_y + 80
    for i, step in enumerate(slide.get("howto", []), start=1):
        # number badge
        draw.ellipse((panel_x + 28, hy, panel_x + 68, hy + 40), fill=TEAL)
        draw.text((panel_x + 38, hy + 4), str(i), font=load_font("en", 24, True), fill=WHITE)
        lines = wrap_lines(draw, step, how_font, panel_w - 120, wrap)
        tx = panel_x + 84
        ty = hy
        for ln in lines:
            draw.text((tx, ty), ln, font=how_font, fill=MUTED)
            ty += how_font.size + 8
        hy = max(hy + 52, ty + 12)

    tip = slide.get("tip")
    if tip:
        draw.rounded_rectangle((panel_x + 20, 780, panel_x + panel_w - 20, 860), radius=14, fill=(232, 245, 243))
        tip_font = load_font(lang, 24, False)
        tip_lines = wrap_lines(draw, tip, tip_font, panel_w - 80, wrap)
        ty = 798
        for ln in tip_lines[:2]:
            draw.text((panel_x + 40, ty), ln, font=tip_font, fill=TEAL)
            ty += 30

    # right screen
    if slide.get("screen"):
        paste_screen(
            img,
            slide["screen"],
            (860, 150, 1000, 640),
            slide.get("browser_title") or slide.get("highlight") or "이루소",
        )

    # bottom flow banner (search / button — not raw URL typing)
    draw.rectangle((0, 920, W, H), fill=URL_BG)
    draw.rectangle((0, 920, W, 926), fill=GOLD)
    label = slide.get("flow_label") or slide.get("url_label", "")
    draw.text((48, 942), label, font=load_font(lang, 26, True), fill=RED)
    highlight = slide.get("highlight") or slide.get("url") or ""
    hi_font = load_font(lang, 38, True)
    draw.text((48, 988), highlight, font=hi_font, fill=NAVY)
    draw.text((1480, 1005), "검색 → 클릭 → 이동", font=load_font("ko", 22, True), fill=GOLD)

    out = out_dir / f"slide_{idx:02d}.png"
    img.save(out, "PNG")
    return out


CONTENT = {
    "ko": {
        "slides": [
            {
                "eyebrow": "이루소 이용 영상가이드 · 천천히 따라 하세요",
                "title": "검색해서 들어가고\n버튼만 누르면 됩니다",
                "howto_title": "이용 흐름",
                "howto": [
                    "네이버에서 ‘이루소 추모서비스’ 검색",
                    "검색 결과에서 이루소 서비스를 누름",
                    "화면의 큰 버튼을 따라 회원가입·신청·체험",
                    "주소는 직접 치지 않아도 됩니다",
                ],
                "tip": "자녀분이 카카오톡으로 보낸 링크가 있으면, 그 링크만 눌러도 됩니다.",
                "flow_label": "검색어",
                "highlight": SEARCH_KEYWORD,
                "browser_title": "네이버 검색",
                "screen": "naver",
                "narration": "이루소 이용 영상가이드입니다. 주소를 직접 치지 마세요. 네이버에서 이루소 추모서비스를 검색한 뒤, 검색 결과에서 이루소 서비스를 누르고, 화면의 큰 버튼을 따라가면 됩니다.",
                "step": None,
            },
            {
                "eyebrow": "시작 · 네이버에서 찾기",
                "title": "네이버에서\n이루소 검색하기",
                "howto_title": "따라 하기",
                "howto": [
                    "네이버 앱 또는 네이버 홈을 엽니다",
                    "검색창에 ‘이루소 추모서비스’를 적습니다",
                    "초록색 검색 버튼을 누릅니다",
                    "결과에서 ‘이루소’ ‘추모관’이 보이면 누릅니다",
                ],
                "tip": "결과가 헷갈리면 자녀분께 ‘이루소 추모서비스 검색해서 들어가 주세요’라고 말씀하세요.",
                "flow_label": "검색창에 적을 말",
                "highlight": SEARCH_KEYWORD,
                "browser_title": "네이버 검색",
                "screen": "naver",
                "narration": "먼저 네이버를 엽니다. 검색창에 이루소 추모서비스를 적고 검색을 누르세요. 결과에서 이루소 또는 추모관이 보이면 그 항목을 누릅니다.",
                "step": "01 / 10",
            },
            {
                "eyebrow": "1단계 · 회원가입",
                "title": "홈에서 회원가입 누르기",
                "howto_title": "따라 하기",
                "howto": [
                    "이루소 화면에 들어오면 성공입니다",
                    "‘회원가입’ 또는 ‘추모관 개설’을 누릅니다",
                    "처음이면 ‘무료 체험’을 고릅니다",
                    "파란 ‘다음’ 버튼을 누릅니다",
                ],
                "tip": "화면이 작으면 맨 아래 ‘화면이 잘 안 보이나요?’를 눌러 보세요.",
                "flow_label": "누를 버튼",
                "highlight": "회원가입 / 무료 체험 → 다음",
                "browser_title": "회원가입",
                "screen": "signup",
                "narration": "이루소 화면에 들어오면, 회원가입 또는 추모관 개설을 누르세요. 처음이면 무료 체험을 고르고, 파란 다음 버튼을 누릅니다.",
                "step": "02 / 10",
            },
            {
                "eyebrow": "1단계 · 회원가입",
                "title": "계정 만들고 가입 완료",
                "howto_title": "따라 하기",
                "howto": [
                    "아이디와 비밀번호를 적습니다",
                    "안내에 따라 가입을 마칩니다",
                    "카카오·네이버로 이어갈 수도 있습니다",
                    "가입이 끝나면 로그인할 수 있습니다",
                ],
                "tip": "비밀번호는 자녀분과 함께 정해 두시면 나중에 찾기 쉽습니다.",
                "flow_label": "이 화면에서",
                "highlight": "아이디 · 비밀번호 입력 후 완료",
                "browser_title": "회원가입",
                "screen": "signup",
                "narration": "아이디와 비밀번호를 적고 가입을 마칩니다. 카카오 또는 네이버로 이어갈 수도 있습니다. 비밀번호는 가족과 함께 정해 두세요.",
                "step": "03 / 10",
            },
            {
                "eyebrow": "2단계 · 추모관 이용신청",
                "title": "상담·개설 신청 누르기",
                "howto_title": "따라 하기",
                "howto": [
                    "홈에서 ‘상담 신청’ 또는 ‘추모관 개설’을 누릅니다",
                    "이름, 연락처, 고인 성함을 적습니다",
                    "신청 버튼을 누릅니다",
                    "접수되면 관리자가 확인합니다",
                ],
                "tip": "전화·카카오톡으로 자녀분이 대신 신청해 주셔도 됩니다.",
                "flow_label": "누를 버튼",
                "highlight": "상담 신청 · 추모관 개설",
                "browser_title": "이루소 홈",
                "screen": "home",
                "narration": "홈에서 상담 신청 또는 추모관 개설을 누르세요. 이름, 연락처, 고인 성함을 적고 신청합니다. 자녀분이 대신 신청해 주셔도 됩니다.",
                "step": "04 / 10",
            },
            {
                "eyebrow": "3단계 · 사용승인",
                "title": "관리자 승인 기다리기",
                "howto_title": "이렇게 됩니다",
                "howto": [
                    "신청 내용을 관리자가 검토합니다",
                    "승인이 되면 안내를 받을 수 있습니다",
                    "급한 부고는 먼저 개설할 수 있습니다",
                    "문의는 다시 ‘상담 신청’으로 남겨 주세요",
                ],
                "tip": "승인이 오래 걸리면 신청 때 남긴 연락처로 문의해 주세요.",
                "flow_label": "기다리는 단계",
                "highlight": "관리자 승인 → 이용 시작",
                "browser_title": "이루소 홈",
                "screen": "home",
                "narration": "관리자가 신청을 검토한 뒤 사용을 승인합니다. 급한 부고는 먼저 개설할 수 있습니다. 오래 걸리면 남겨 두신 연락처로 문의해 주세요.",
                "step": "05 / 10",
            },
            {
                "eyebrow": "4단계 · 로그인",
                "title": "다시 들어올 때 로그인",
                "howto_title": "따라 하기",
                "howto": [
                    "네이버에서 다시 ‘이루소 추모서비스’를 검색해 들어옵니다",
                    "노란색 카카오 또는 초록 네이버 로그인을 누릅니다",
                    "또는 아이디·비밀번호를 넣고 ‘로그인’을 누릅니다",
                    "게스트로 추모관만 볼 수도 있습니다",
                ],
                "tip": "처음 방문이면 ‘회원가입’을, 이미 가입했으면 ‘로그인’을 누르세요.",
                "flow_label": "누를 버튼",
                "highlight": "카카오 로그인 · 네이버 로그인",
                "browser_title": "로그인",
                "screen": "login",
                "narration": "다시 들어올 때는 네이버에서 이루소 추모서비스를 검색해 들어옵니다. 카카오 또는 네이버 로그인을 누르거나, 아이디와 비밀번호로 로그인하세요.",
                "step": "06 / 10",
            },
            {
                "eyebrow": "5단계 · 추모관 · 앱 사용",
                "title": "마이페이지에서 이용",
                "howto_title": "할 수 있는 일",
                "howto": [
                    "추모관을 열어 사진을 올립니다",
                    "방명록에 추모 글을 남깁니다",
                    "부고·일정·배경영상을 관리합니다",
                    "가족 승인으로 공개 범위를 지킵니다",
                ],
                "tip": "처음에는 사진 한 장만 올려도 충분합니다.",
                "flow_label": "로그인 후",
                "highlight": "사진 · 방명록 · 부고 · 일정",
                "browser_title": "추모관 / 앱",
                "screen": "login",
                "narration": "로그인 후 마이페이지에서 추모관을 엽니다. 사진, 방명록, 부고, 일정을 이용할 수 있습니다. 처음에는 사진 한 장만 올려도 충분합니다.",
                "step": "07 / 10",
            },
            {
                "eyebrow": "6단계 · 온라인 제사당",
                "title": "제사당 무료체험 누르기",
                "howto_title": "따라 하기",
                "howto": [
                    "홈에서 ‘온라인 제사당 무료체험’을 누릅니다",
                    "가입 안내가 나오면 회원가입을 먼저 마칩니다",
                    "다시 홈으로 돌아와 무료체험을 누릅니다",
                    "원하는 제사 서비스를 고르고 진행합니다",
                ],
                "tip": "현장 키오스크는 큰 버튼을 누르면 됩니다. 필요하면 ‘직원 호출’을 누르세요.",
                "flow_label": "누를 버튼",
                "highlight": "온라인 제사당 무료체험",
                "browser_title": "이루소 홈",
                "screen": "home",
                "narration": "홈에서 온라인 제사당 무료체험을 누르세요. 가입이 필요하면 먼저 가입한 뒤, 다시 무료체험을 눌러 원하는 서비스를 고르고 진행합니다.",
                "step": "08 / 10",
            },
            {
                "eyebrow": "흐름 한눈에 보기",
                "title": "검색 → 클릭 → 버튼",
                "howto_title": "전체 흐름",
                "howto": [
                    "네이버 검색: 이루소 추모서비스",
                    "검색 결과에서 이루소 클릭",
                    "회원가입 · 상담신청 · 로그인 버튼",
                    "온라인 제사당 무료체험 버튼",
                ],
                "tip": "이 화면을 사진으로 찍어 두시면 나중에 찾기 쉽습니다.",
                "flow_label": "기억하세요",
                "highlight": "검색 → 클릭 → 큰 버튼",
                "browser_title": "이용 흐름",
                "screen": "naver",
                "narration": "전체 흐름입니다. 네이버에서 이루소 추모서비스를 검색하고, 이루소를 누른 뒤, 회원가입, 상담신청, 로그인, 제사당 무료체험 버튼을 따라가면 됩니다.",
                "step": "09 / 10",
            },
            {
                "eyebrow": "마치며",
                "title": "기억은 이어지고\n예는 이어집니다",
                "howto_title": "도움이 필요하면",
                "howto": [
                    "홈에서 ‘상담 신청’을 남겨 주세요",
                    "이 영상을 자녀분께 보여 주세요",
                    "검색과 버튼 누르기는 가족과 함께 하세요",
                ],
                "tip": "혼자 하기 어려우면 가족과 함께 보는 것을 권합니다.",
                "flow_label": "도움이 필요하면",
                "highlight": "상담 신청 · 가족과 함께",
                "browser_title": "이루소 홈",
                "screen": "home",
                "narration": "기억은 이어지고, 예는 이어집니다. 도움이 필요하면 홈에서 상담 신청을 남기거나, 이 영상을 자녀분께 보여 주세요. 검색과 버튼 누르기는 가족과 함께 하시면 더 쉽습니다.",
                "step": "10 / 10",
            },
        ],
    },
}


def get_content(lang: str) -> dict:
    """Non-ko languages reuse the same search→click flow with translated overlays when available."""
    base_slides = CONTENT["ko"]["slides"]
    if lang == "ko":
        return CONTENT["ko"]

    # Lightweight overlays (title/howto/narration). Screens/flow stay identical.
    overlays = {
        "en": {
            "narration_prefix": "Follow the same clicks. ",
            "flow_note": "Search on Naver → tap Eruso → tap big buttons. Do not type long URLs.",
        },
        "zh": {
            "narration_prefix": "请按相同点击流程。",
            "flow_note": "在Naver搜索 → 点이루소 → 点大按钮。不要手打长网址。",
        },
        "ja": {
            "narration_prefix": "同じタップ手順です。",
            "flow_note": "Naver検索 → 이루소をタップ → 大きなボタン。長いURLは打たない。",
        },
        "hi": {
            "narration_prefix": "वही क्लिक प्रवाह अपनाएँ। ",
            "flow_note": "Naver खोज → Eruso टैप → बड़े बटन। लंबा URL न लिखें।",
        },
    }
    note = overlays.get(lang, overlays["en"])
    slides = []
    for s in base_slides:
        m = dict(s)
        # Keep Korean on-screen instructional text for UI matching; localize spoken guide.
        m["narration"] = note["narration_prefix"] + s["narration"]
        m["flow_label"] = note["flow_note"] if s.get("step") is None else s.get("flow_label", "")
        if s.get("step") is None:
            m["highlight"] = SEARCH_KEYWORD
        slides.append(m)
    return {"slides": slides}


def media_duration(path: Path) -> float:
    raw = subprocess.check_output(
        [str(FFPROBE), "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        text=True,
    )
    return float(json.loads(raw)["format"]["duration"])


def synthesize_narration(lang: str, idx: int, text: str, out_dir: Path) -> Path:
    if not EDGE_TTS:
        raise SystemExit("edge-tts CLI not found")
    out = out_dir / f"voice_{idx:02d}.mp3"
    subprocess.run(
        [EDGE_TTS, "--voice", VOICES[lang], "--rate", RATE, "--text", text, "--write-media", str(out)],
        check=True,
    )
    return out


def make_slide_clip(idx: int, image: Path, voice: Path, duration: float, out_dir: Path) -> Path:
    out = out_dir / f"clip_{idx:02d}.mp4"
    subprocess.run(
        [
            str(FFMPEG), "-y", "-loop", "1", "-i", str(image), "-i", str(voice),
            "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-tune", "stillimage",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
            "-af", f"apad=whole_dur={duration:.3f}", "-t", f"{duration:.3f}", "-shortest", str(out),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return out


def build_video(clips: list[Path], out_mp4: Path, list_file: Path) -> None:
    list_file.write_text("\n".join(f"file '{p.as_posix()}'" for p in clips), encoding="utf-8")
    subprocess.run(
        [
            str(FFMPEG), "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
            "-ar", "44100", "-ac", "1", "-movflags", "+faststart", str(out_mp4),
        ],
        check=True,
    )
    print(f"OK -> {out_mp4}")


def build_lang(lang: str) -> Path:
    pack = get_content(lang)
    out_dir = BASE_DIR / lang
    out_dir.mkdir(parents=True, exist_ok=True)
    out_mp4 = HOME / "images" / f"workflow-guide-{lang}.mp4"
    slides = pack["slides"]
    paths = [render_guide_slide(lang, i, s, out_dir) for i, s in enumerate(slides, start=1)]
    print(f"[{lang}] slides: {len(paths)}", flush=True)

    clips: list[Path] = []
    total = 0.0
    for i, slide in enumerate(slides, start=1):
        print(f"[{lang}] tts+clip {i}/{len(slides)}...", flush=True)
        voice = synthesize_narration(lang, i, slide["narration"], out_dir)
        dur = max(media_duration(voice) + PAD_AFTER_SEC, MIN_SLIDE_SEC)
        total += dur
        clips.append(make_slide_clip(i, paths[i - 1], voice, dur, out_dir))

    print(f"[{lang}] audio ~{total:.1f}s", flush=True)
    build_video(clips, out_mp4, out_dir / "clips_concat.txt")
    print(f"[{lang}] final: {media_duration(out_mp4):.1f}s", flush=True)
    if lang == "ko":
        shutil.copyfile(out_mp4, HOME / "images" / "workflow-guide.mp4")
        shutil.copyfile(out_dir / "slide_01.png", BASE_DIR / "slide_01.png")
    return out_mp4


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", nargs="*", default=["ko", "en", "zh", "ja", "hi"])
    args = parser.parse_args()
    if not FFMPEG.exists():
        raise SystemExit(f"ffmpeg not found: {FFMPEG}")
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    for lang in args.lang:
        build_lang(lang)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        print(f"command failed: {e}", file=sys.stderr)
        raise
