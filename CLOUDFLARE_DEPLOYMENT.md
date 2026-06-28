# ☁️ Cloudflare Pages 배포 가이드 - eruso.co.kr

## 🎯 목표
Cloudflare Pages를 통해 eruso.co.kr에 최신 변경사항 배포

---

## 📋 업로드 필요 파일 체크리스트

### ✅ 필수 파일
```
✅ index.html                              (25 KB)
✅ robots.txt                              (490 bytes)
✅ sitemap.xml                             (1.4 KB)
✅ manifest.json                           (963 bytes)
```

### 📁 CSS 폴더
```
✅ css/style.css                           (41 KB)
```

### 📁 JS 폴더
```
✅ js/main.js                              (12 KB)
✅ js/particles.js                         (4 KB)
```

### 📁 Images 폴더 (핵심 이미지만)

**🆕 새로 추가/교체된 이미지**:
```
🆕 images/about-drone-delivery-city.jpg      (802 KB) - 드론 배송 이미지
🆕 images/warehouse-logistics-modern.jpg     (429 KB) - 물류 창고 이미지
```

**필수 이미지**:
```
✅ images/logo-eruso.png                   (5 KB)
✅ images/logo-eruso.svg                   (419 bytes)
✅ images/hero-real-city-night.jpg         (1.1 MB)
```

**기타 이미지** (선택사항, 용량 절약 원하면 제외 가능):
```
images/hero-real-city-sunset.jpg           (468 KB)
images/city-modern-skyline.jpg             (703 KB)
images/smart-city-tech.jpg                 (116 KB)
images/pharmacy-professional.jpg           (170 KB)
images/drone-sky-blue.jpg                  (259 KB)
... (기타 이미지들)
```

---

## 🚀 **방법 1: Cloudflare Dashboard 웹 UI** (추천!)

### 단계 1: Dashboard 접속
1. 브라우저에서 https://dash.cloudflare.com
2. 로그인

### 단계 2: Pages 프로젝트 선택
1. 좌측 메뉴: **"Workers & Pages"**
2. 상단 탭: **"Pages"**
3. eruso.co.kr 연결된 프로젝트 클릭

### 단계 3: 새 배포 만들기

**Git 연동된 경우**:
- 프로젝트 페이지 우측 상단
- **"⋮"** 메뉴 또는 **"Actions"** 클릭
- **"Create deployment"** 선택

**Direct Upload 방식**:
- **"Create deployment"** 버튼 클릭

### 단계 4: 파일 업로드

#### A. 폴더 구조 확인
로컬 컴퓨터에 다음과 같이 폴더 준비:
```
eruso-deploy/
├── index.html
├── robots.txt
├── sitemap.xml
├── manifest.json
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── particles.js
└── images/
    ├── logo-eruso.png
    ├── logo-eruso.svg
    ├── hero-real-city-night.jpg
    ├── about-drone-delivery-city.jpg
    ├── warehouse-logistics-modern.jpg
    └── ... (기타 이미지)
```

#### B. 업로드
- **"Select folder"** 또는 **드래그 & 드롭**
- `eruso-deploy` 폴더 선택
- **"Deploy site"** 클릭

### 단계 5: 배포 완료 대기
- 진행 상황 모니터링 (1~2분)
- ✅ "Success!" 확인

### 단계 6: 캐시 삭제

#### Cloudflare 캐시 퍼지:
1. Cloudflare Dashboard 홈
2. **"eruso.co.kr"** 도메인 선택
3. 좌측 메뉴 **"Caching"** → **"Configuration"**
4. **"Purge Everything"** 클릭
5. 확인

#### 브라우저 캐시:
- **Ctrl + Shift + Delete** → 전체 삭제
- 또는 **Ctrl + F5** (강력 새로고침)

---

## 🔄 **방법 2: Git 연동 (GitHub/GitLab)**

### Git 저장소가 연결된 경우:

#### 1. 저장소 확인
Cloudflare Pages 프로젝트 페이지에서 연결된 저장소 확인

#### 2. 로컬에서 변경사항 커밋
```bash
# 파일 추가
git add index.html
git add css/style.css
git add images/about-drone-delivery-city.jpg
git add images/warehouse-logistics-modern.jpg

# 커밋
git commit -m "드론 배송 이미지 교체 및 선명도 개선"

# Push
git push origin main
```

#### 3. 자동 배포
- Cloudflare Pages가 자동으로 감지
- 2~3분 후 배포 완료

#### 4. 배포 상태 확인
- Cloudflare Dashboard → Pages → 프로젝트
- 최신 배포 상태 확인

---

## 🐛 **문제 해결**

### 문제 1: "API key validation failed with status 400"
**원인**: CLI/Wrangler 사용 시 API 키 오류
**해결**: 
- ✅ **웹 UI 사용** (API 불필요!)
- Cloudflare Dashboard에서 직접 업로드

### 문제 2: 배포 후에도 이전 페이지 표시
**원인**: 
- CDN 캐시
- 브라우저 캐시
**해결**:
1. **Cloudflare 캐시 퍼지**:
   - Dashboard → 도메인 → Caching → Purge Everything
2. **브라우저 캐시 삭제**:
   - Ctrl + Shift + Delete
3. **시크릿 모드 테스트**:
   - Ctrl + Shift + N

### 문제 3: 일부 파일만 업데이트하고 싶음
**원인**: Cloudflare Pages는 전체 사이트 배포 방식
**해결**: 
- 전체 폴더를 다시 업로드해야 함
- 변경된 파일만 수정 후 전체 업로드

### 문제 4: Git 연동인데 Push가 배포 트리거 안 됨
**원인**: 
- 잘못된 브랜치에 Push
- Webhook 설정 오류
**해결**:
1. Cloudflare Pages 설정에서 **Production branch** 확인
2. 해당 브랜치에 Push:
   ```bash
   git push origin main  # 또는 master
   ```
3. Settings → Builds → Rebuild 클릭

### 문제 5: 업로드 용량 초과
**원인**: 이미지 파일 용량이 큼
**해결**:
- 불필요한 대용량 이미지 제외
- 필수 이미지만 업로드:
  ```
  ✅ logo-eruso.png/svg
  ✅ hero-real-city-night.jpg
  ✅ about-drone-delivery-city.jpg
  ✅ warehouse-logistics-modern.jpg
  ```

---

## 📊 **배포 확인 체크리스트**

### 배포 전:
- [ ] 모든 필수 파일 준비됨
- [ ] 폴더 구조 확인
- [ ] Git 연동 시: 변경사항 커밋

### 배포 중:
- [ ] Cloudflare Dashboard 접속
- [ ] Pages 프로젝트 선택
- [ ] 파일 업로드 또는 Git Push
- [ ] 배포 진행 상황 확인

### 배포 후:
- [ ] "Success!" 메시지 확인
- [ ] Cloudflare 캐시 퍼지
- [ ] 브라우저 캐시 삭제
- [ ] https://www.eruso.co.kr 접속 테스트
- [ ] **About 섹션** 드론 배송 이미지 확인 ✅
- [ ] 모바일 반응형 확인
- [ ] 콘솔 에러 없음 확인 (F12)

---

## 🎯 **최소 배포 (빠른 테스트)**

시간이 없다면 **핵심 파일만** 업로드:

```
최소 파일 세트 (약 2 MB):
✅ index.html
✅ css/style.css
✅ js/main.js
✅ js/particles.js
✅ images/logo-eruso.png
✅ images/hero-real-city-night.jpg
✅ images/about-drone-delivery-city.jpg
✅ images/warehouse-logistics-modern.jpg
```

---

## 🔗 **유용한 링크**

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Cloudflare Pages 문서**: https://developers.cloudflare.com/pages/
- **Cloudflare Community**: https://community.cloudflare.com/

---

## 📞 **지원**

**Cloudflare 지원**:
- Community: https://community.cloudflare.com/
- Discord: https://discord.cloudflare.com/

**프로젝트 문의**:
- 이메일: info@eruso.co.kr
- 전화: 1588-0000

---

## 📝 **배포 기록**

**날짜**: 2026-02-07  
**변경 내용**:
- 의료 연구실 이미지 → 드론 배송 이미지 교체
- about-drone-delivery-city.jpg (802 KB) 추가
- warehouse-logistics-modern.jpg (429 KB) 추가
- CSS 선명도 최적화

**예상 효과**:
- ✅ 서비스 컨셉 명확화
- ✅ 고객 이해도 향상
- ✅ 브랜드 정합성 강화
