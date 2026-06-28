# 🎬 비디오 배경 설정 가이드

## 현재 상태

**Hero 섹션 배경**이 **실제 비디오 재생** 방식으로 변경되었습니다!

---

## 📹 비디오 교체 방법

### 1️⃣ **비디오 파일 준비**

**추천 사양**:
- **형식**: MP4 (H.264 코덱)
- **해상도**: 1920x1080 (Full HD) 이상
- **길이**: 10~30초 (루프 재생됨)
- **용량**: 5~20MB (최적화 추천)
- **FPS**: 30fps

**추천 내용**:
- 의료진/간호사 작업 장면
- 병원/약국 환경
- 로봇/AI 헬스케어 기술
- 따뜻한 환자 케어 장면

---

### 2️⃣ **무료 비디오 다운로드 사이트**

**1. Pexels Videos** (추천 ⭐⭐⭐⭐⭐)
- URL: https://www.pexels.com/videos/
- 검색어:
  - "healthcare workers"
  - "medical staff"
  - "hospital"
  - "nurse"
  - "pharmacy"
  - "healthcare technology"

**2. Pixabay Videos**
- URL: https://pixabay.com/videos/
- 검색어:
  - "medical"
  - "doctor"
  - "healthcare"
  - "hospital staff"

**3. Videvo**
- URL: https://www.videvo.net/
- 검색어: "healthcare", "medical"

**4. Coverr**
- URL: https://coverr.co/
- 카테고리: Business, People

---

### 3️⃣ **비디오 파일 적용 방법**

#### 방법 A: 로컬 파일 사용

**1. 비디오 파일 저장**:
```
프로젝트폴더/
└── videos/
    ├── healthcare-staff.mp4
    └── healthcare-staff.webm (선택사항)
```

**2. HTML 수정** (`index.html` 35번째 줄):
```html
<video id="hero-video" class="hero-video" autoplay muted loop playsinline>
    <source src="videos/healthcare-staff.mp4" type="video/mp4">
    <source src="videos/healthcare-staff.webm" type="video/webm">
</video>
```

#### 방법 B: 외부 URL 사용

**HTML 수정**:
```html
<video id="hero-video" class="hero-video" autoplay muted loop playsinline>
    <source src="https://example.com/your-video.mp4" type="video/mp4">
</video>
```

---

### 4️⃣ **추천 비디오 예시**

현재 임시로 들어간 비디오:
```
https://cdn.pixabay.com/video/2023/05/18/162784-828622396_large.mp4
```

**더 나은 비디오를 찾아서 교체하세요!**

**추천 키워드** (Pexels/Pixabay):
1. "healthcare professionals working"
2. "medical team meeting"
3. "pharmacy technician"
4. "nurse helping patient"
5. "hospital technology"
6. "healthcare innovation"

---

## 🎛️ 비디오 설정 옵션

### HTML 속성

```html
<video 
    autoplay    → 자동 재생
    muted       → 음소거 (자동재생 필수)
    loop        → 무한 반복
    playsinline → 모바일 인라인 재생
    poster="이미지.jpg"  → 로딩 중 표시 이미지
>
```

### CSS 필터 조정

현재 설정:
```css
.hero-video {
    filter: brightness(0.6) contrast(1.1);
}
```

**조정 예시**:
```css
/* 더 어둡게 (가독성 향상) */
filter: brightness(0.4) contrast(1.2);

/* 더 밝게 */
filter: brightness(0.8) contrast(1.0);

/* 흑백 */
filter: brightness(0.6) grayscale(100%);

/* 블러 + 어둡게 */
filter: brightness(0.5) blur(3px);
```

---

## 🔄 Fallback 시스템

**3단계 Fallback**:

```
1순위: Video (hero-video) → 실제 영상
   ↓ 로딩 실패시
2순위: Canvas Particles → 파티클 애니메이션
   ↓ Canvas 미지원시
3순위: Static Image → 정적 이미지
```

모든 환경에서 작동 보장!

---

## 📊 성능 최적화

### 비디오 최적화 팁

**1. 해상도 줄이기**:
- 4K → Full HD (1920x1080)
- Full HD → HD (1280x720)

**2. 비트레이트 줄이기**:
- 온라인 도구: https://www.videosmaller.com/
- 추천 비트레이트: 2-5 Mbps

**3. 짧게 자르기**:
- 10~20초로 제한
- 자연스러운 루프 포인트

**4. WebM 포맷 추가**:
- MP4보다 30% 작음
- 대부분의 브라우저 지원

---

## 🚀 빠른 시작

**1분 안에 비디오 교체하기**:

1. Pexels 접속: https://www.pexels.com/videos/
2. "healthcare workers" 검색
3. 마음에 드는 비디오 다운로드
4. `videos/` 폴더에 저장
5. `index.html` 35번째 줄 수정:
   ```html
   <source src="videos/다운로드한파일.mp4" type="video/mp4">
   ```
6. 새로고침! ✅

---

## 🎬 현재 적용된 비디오

**임시 비디오**:
- URL: Pixabay CDN
- 내용: (확인 필요)
- 상태: 테스트용

**⚠️ 더 적합한 비디오로 교체를 권장합니다!**

---

## 💡 팁

1. **루프가 자연스러운 비디오** 선택
2. **첫 프레임과 마지막 프레임이 비슷한** 비디오
3. **너무 빠르지 않은** 부드러운 움직임
4. **주제와 관련된** 의료/헬스케어 장면
5. **밝기가 적당한** 비디오 (너무 어둡거나 밝지 않게)

---

## ❓ 문제 해결

### 비디오가 재생되지 않아요

**체크리스트**:
- [ ] 파일 경로가 정확한가?
- [ ] 파일 형식이 MP4인가?
- [ ] 파일 크기가 너무 크지 않은가? (20MB 이하)
- [ ] `autoplay muted` 속성이 있는가?
- [ ] 서버에서 호스팅되고 있는가? (로컬 파일 시스템 제한)

### 비디오가 너무 느려요

**해결법**:
- 해상도 낮추기 (1280x720)
- 비트레이트 줄이기
- 짧게 자르기 (10초)
- WebM 형식 사용

### 모바일에서 작동 안 해요

**해결법**:
- `playsinline` 속성 추가 (이미 적용됨 ✅)
- `muted` 속성 필수 (이미 적용됨 ✅)
- iOS Safari는 일부 제한 있음

---

Made with ❤️ by (주)이루소
