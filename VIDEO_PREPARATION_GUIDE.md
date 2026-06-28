# 📹 반응형 비디오 준비 가이드

## 🎯 개요

웹사이트에서 사용할 반응형 비디오를 여러 해상도로 준비하는 가이드입니다.

---

## 📊 필요한 비디오 파일

| 파일명 | 해상도 | 예상 크기 | 용도 |
|--------|--------|-----------|------|
| **main_4k.mp4** | 3840 x 2160 | 40-60 MB | 대형 데스크톱 (2560px+) |
| **main_2k.mp4** | 2560 x 1440 | 15-25 MB | 일반 데스크톱 (1920px+) |
| **main_1080p.mp4** | 1920 x 1080 | 8-15 MB | 랩톱/태블릿 (1024px+) |
| **main.mp4** | 1280 x 720 | 3-8 MB | 모바일/기본값 |

---

## 🛠️ FFmpeg로 비디오 생성하기

### 1️⃣ **FFmpeg 설치 확인**

```bash
ffmpeg -version
```

**설치 안 되어 있다면:**
- Windows: `choco install ffmpeg`
- 또는: https://ffmpeg.org/download.html

---

### 2️⃣ **원본 비디오에서 여러 해상도 생성**

**원본 파일:** `video-1770770789023(4k).mp4` (55 MB)

```bash
cd /d/Github/eruso/eruso

# 1. 4K 버전 (3840x2160) - 고품질
ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=3840:2160 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k main_4k.mp4

# 2. 2K 버전 (2560x1440) - 중간 품질
ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=2560:1440 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k main_2k.mp4

# 3. 1080p 버전 (1920x1080) - 표준 품질
ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=1920:1080 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k main_1080p.mp4

# 4. 720p 버전 (1280x720) - 모바일 최적화
ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=1280:720 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 96k main.mp4
```

---

### 3️⃣ **더 작은 파일 크기 (H.265/HEVC 사용)**

```bash
# H.265 코덱으로 크기 줄이기 (50% 절감)
ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=3840:2160 -c:v libx265 -preset medium -crf 28 -c:a aac -b:a 192k main_4k.mp4

ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=2560:1440 -c:v libx265 -preset medium -crf 28 -c:a aac -b:a 128k main_2k.mp4

ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=1920:1080 -c:v libx265 -preset medium -crf 28 -c:a aac -b:a 128k main_1080p.mp4

ffmpeg -i video-1770770789023\(4k\).mp4 -vf scale=1280:720 -c:v libx265 -preset medium -crf 28 -c:a aac -b:a 96k main.mp4
```

---

## 📥 FFmpeg 없이 온라인 도구 사용

### **온라인 비디오 변환 사이트:**

1. **Clideo** - https://clideo.com/resize-video
2. **Online-Convert** - https://video.online-convert.com/
3. **FreeConvert** - https://www.freeconvert.com/video-converter

**단계:**
1. 원본 비디오 업로드
2. 각 해상도로 변환:
   - 3840x2160 → main_4k.mp4
   - 2560x1440 → main_2k.mp4
   - 1920x1080 → main_1080p.mp4
   - 1280x720 → main.mp4
3. 다운로드 후 프로젝트에 복사

---

## 📁 파일 배치

```
/d/Github/eruso/eruso/
├── main.mp4          (720p, 3-8 MB) ← 기본값/모바일
├── main_1080p.mp4    (1080p, 8-15 MB)
├── main_2k.mp4       (2K, 15-25 MB)
└── main_4k.mp4       (4K, 40-60 MB)
```

---

## ✅ 파일 확인

```bash
cd /d/Github/eruso/eruso

# 파일 크기 확인
ls -lh main*.mp4

# 비디오 정보 확인
ffmpeg -i main_4k.mp4 2>&1 | grep "Video:"
ffmpeg -i main_2k.mp4 2>&1 | grep "Video:"
ffmpeg -i main_1080p.mp4 2>&1 | grep "Video:"
ffmpeg -i main.mp4 2>&1 | grep "Video:"
```

**예상 출력:**
```
-rw-r--r-- 1 user user  50M main_4k.mp4
-rw-r--r-- 1 user user  20M main_2k.mp4
-rw-r--r-- 1 user user  12M main_1080p.mp4
-rw-r--r-- 1 user user   5M main.mp4
```

---

## 🚀 Git에 추가

```bash
cd /d/Github/eruso/eruso

# 모든 비디오 파일 추가
git add main.mp4 main_1080p.mp4 main_2k.mp4 main_4k.mp4

# 커밋
git commit -m "반응형 비디오 추가: 720p/1080p/2K/4K 다중 해상도"

# 푸시
git push origin main
```

---

## ⚠️ Git LFS 권장

비디오 파일이 크므로 Git LFS 사용을 권장합니다:

```bash
# Git LFS 설치
git lfs install

# mp4 파일 추적
git lfs track "*.mp4"

# .gitattributes 추가
git add .gitattributes

# 이후 일반적으로 add/commit/push
git add main*.mp4
git commit -m "Add responsive videos with Git LFS"
git push origin main
```

---

## 🎯 최종 테스트

```bash
# 로컬 서버 실행
python -m http.server 8000
```

**브라우저에서 테스트:**
1. http://localhost:8000/index.html 열기
2. 브라우저 창 크기 조절:
   - **큰 화면 (2560px+)**: main_4k.mp4 로드
   - **일반 화면 (1920px+)**: main_2k.mp4 로드
   - **중간 화면 (1024px+)**: main_1080p.mp4 로드
   - **작은 화면**: main.mp4 로드
3. 개발자 도구 (F12) → Network 탭에서 로드된 파일 확인

---

## 📊 효과

### **Before (단일 파일):**
- 모든 디바이스: 55 MB 다운로드
- 모바일: 불필요한 데이터 낭비

### **After (반응형):**
- 대형 데스크톱: 50 MB (4K)
- 일반 데스크톱: 20 MB (2K)
- 랩톱/태블릿: 12 MB (1080p)
- 모바일: 5 MB (720p)

**절감 효과:** 모바일에서 90% 절감! ✅

---

## 🎬 완료!

반응형 비디오 시스템이 준비되었습니다. 각 디바이스에서 최적의 해상도가 자동으로 선택됩니다! 🚀
