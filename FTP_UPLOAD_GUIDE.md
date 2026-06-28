# 🚀 FTP 업로드 가이드 - eruso.co.kr

## 📋 목표
현재 프로젝트 파일을 eruso.co.kr 서버에 FTP로 업로드하여 최신 변경사항 반영

---

## 🔧 준비물

### 1. FTP 클라이언트 다운로드
- **FileZilla** (추천): https://filezilla-project.org
- **WinSCP** (Windows): https://winscp.net
- **Cyberduck** (Mac): https://cyberduck.io

### 2. FTP 접속 정보 (가비아에서 확인)
```
호스트: ftp.eruso.co.kr
포트: 21 (FTP) 또는 22 (SFTP 권장)
사용자명: [가비아 FTP 계정 ID]
비밀번호: [가비아 FTP 비밀번호]
```

**FTP 정보 확인 방법**:
1. 가비아 로그인
2. My가비아 → 호스팅 관리
3. 호스팅 상세보기 → FTP 정보 확인

---

## 📂 업로드할 파일 목록

### ✅ **필수 파일** (반드시 업로드)
```
✅ index.html                           # 메인 페이지 (25 KB)
✅ css/style.css                        # 스타일시트 (41 KB)
✅ js/main.js                           # 메인 스크립트 (12 KB)
✅ js/particles.js                      # 파티클 애니메이션 (4 KB)
```

### 🆕 **새로 추가된 이미지** (방금 교체한 파일들!)
```
🆕 images/about-drone-delivery-city.jpg      # 802 KB - 드론 배송 이미지
🆕 images/warehouse-logistics-modern.jpg     # 429 KB - 물류 창고
```

### 📸 **기존 이미지** (필요시 업로드)
```
images/hero-real-city-night.jpg              # 1.1 MB - Hero 배경
images/hero-real-city-sunset.jpg             # 468 KB
images/city-modern-skyline.jpg               # 703 KB
images/logo-eruso.png                        # 5 KB
images/logo-eruso.svg                        # 419 bytes
... (총 29개 이미지 파일)
```

### ⚙️ **설정 파일**
```
robots.txt                              # SEO 크롤러 설정
sitemap.xml                             # 사이트맵
manifest.json                           # PWA 설정
.htaccess                               # 서버 설정
```

---

## 🎯 **FileZilla 업로드 단계**

### 1단계: FileZilla 실행 및 접속
1. **FileZilla** 실행
2. 상단 입력란에 정보 입력:
   - **호스트**: `ftp.eruso.co.kr` (또는 `sftp://ftp.eruso.co.kr`)
   - **사용자명**: [가비아 FTP ID]
   - **비밀번호**: [가비아 FTP 비밀번호]
   - **포트**: `22` (SFTP) 또는 `21` (FTP)
3. **빠른 연결** 클릭

### 2단계: 서버 폴더 확인
- 우측 창 (원격 사이트)에서 **`/public_html`** 폴더로 이동
- 이 폴더가 웹사이트 루트 디렉토리입니다

### 3단계: 백업 (선택사항, 권장!)
1. 기존 `index.html` 파일 선택
2. 우클릭 → **다운로드**
3. 로컬에 백업 저장 (문제 시 복구용)

### 4단계: 파일 업로드
#### A. 필수 파일 업로드 (덮어쓰기)
1. 좌측 창에서 **`index.html`** 선택
2. 우측 `/public_html`로 드래그 & 드롭
3. "덮어쓰기" 확인 → **예**

4. **`css/style.css`** 업로드:
   - 좌측에서 `css` 폴더 찾기
   - `style.css` 파일을 우측 `/public_html/css/` 폴더로 드래그

5. **`js/` 폴더** 업로드:
   - 좌측 `js` 폴더 선택
   - 우측 `/public_html/js/`로 드래그
   - `main.js`, `particles.js` 모두 덮어쓰기

#### B. 이미지 업로드 (새로 추가된 파일들)
1. 좌측에서 `images` 폴더 열기
2. **새 이미지 2개** 선택:
   - `about-drone-delivery-city.jpg` ✅
   - `warehouse-logistics-modern.jpg` ✅
3. 우측 `/public_html/images/`로 드래그
4. 덮어쓰기 확인 → **예**

### 5단계: 권한 설정 (필요시)
1. 업로드한 파일 선택
2. 우클릭 → **파일 권한** (File Permissions)
3. 설정:
   - **파일** (html, css, js, jpg): `644` (rw-r--r--)
   - **폴더** (css, js, images): `755` (rwxr-xr-x)
4. **확인** 클릭

---

## ⚡ **빠른 업로드 (최소 파일만)**

시간이 없다면 **이 4개 파일만** 업로드하세요:

```bash
1. index.html                              # 🔴 필수!
2. images/about-drone-delivery-city.jpg    # 🆕 새 드론 배송 이미지
3. images/warehouse-logistics-modern.jpg   # 🆕 새 물류 창고 이미지
4. css/style.css                           # 🔴 필수! (선명도 최적화 CSS)
```

**업로드 위치**:
```
/public_html/index.html
/public_html/images/about-drone-delivery-city.jpg
/public_html/images/warehouse-logistics-modern.jpg
/public_html/css/style.css
```

---

## 🔍 **업로드 확인**

### 1. 브라우저에서 확인
1. **Ctrl + F5** (강력 새로고침)로 캐시 삭제
2. https://www.eruso.co.kr 접속
3. **About 섹션**에서 **드론 배송/물류 창고 이미지** 확인 ✅

### 2. FileZilla에서 확인
- 우측 창에서 파일 크기와 날짜 확인
- `about-drone-delivery-city.jpg`: **802 KB**
- `warehouse-logistics-modern.jpg`: **429 KB**

---

## 🐛 **문제 해결**

### 문제 1: 접속이 안 됨
**원인**: FTP 정보 오류
**해결**:
1. 가비아에서 FTP 정보 다시 확인
2. SFTP (포트 22) vs FTP (포트 21) 확인
3. 방화벽 확인

### 문제 2: 파일 업로드 후 사이트가 깨짐
**원인**: 일부 파일만 업로드됨
**해결**:
1. 모든 파일 확인:
   - `index.html` ✅
   - `css/style.css` ✅
   - `js/main.js` ✅
   - `js/particles.js` ✅
2. 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
3. 시크릿 모드로 접속 테스트

### 문제 3: 403 Forbidden 에러
**원인**: 파일 권한 오류
**해결**:
1. FileZilla에서 파일 우클릭
2. **파일 권한** → `644` 설정
3. 폴더 권한 → `755` 설정

### 문제 4: 이미지가 안 보임
**원인**: 
- 파일 경로 오류
- 이미지 파일이 업로드 안 됨
**해결**:
1. `/public_html/images/` 폴더에 파일 존재 확인
2. 파일명 대소문자 정확히 일치 확인:
   - `about-drone-delivery-city.jpg` ✅
   - `About-Drone-Delivery-City.jpg` ❌ (대소문자 틀림!)

---

## 📊 **업로드 체크리스트**

- [ ] FileZilla (또는 FTP 클라이언트) 다운로드 완료
- [ ] 가비아 FTP 정보 확인
- [ ] FTP 접속 성공
- [ ] `/public_html` 폴더로 이동
- [ ] 기존 파일 백업 (선택사항)
- [ ] **index.html** 업로드 ✅
- [ ] **css/style.css** 업로드 ✅
- [ ] **js/main.js** 업로드 ✅
- [ ] **js/particles.js** 업로드 ✅
- [ ] **images/about-drone-delivery-city.jpg** 업로드 🆕
- [ ] **images/warehouse-logistics-modern.jpg** 업로드 🆕
- [ ] 파일 권한 확인 (644/755)
- [ ] 브라우저에서 https://www.eruso.co.kr 접속 확인
- [ ] 강력 새로고침 (Ctrl + F5)
- [ ] About 섹션 이미지 확인 ✅

---

## 🎉 **완료!**

업로드가 완료되면:
- ✅ **드론 배송 이미지** 반영
- ✅ **물류 창고 이미지** 반영
- ✅ **선명도 최적화** CSS 적용
- ✅ **실사 사진**으로 전문성 향상

**업데이트 소요 시간**: 약 **5~10분**

---

## 📞 **추가 지원**

**가비아 고객센터**:
- 전화: **1544-4755** (24시간 운영)
- 웹: https://customer.gabia.com
- FTP 접속 문제 시 문의 가능

**프로젝트 문의**:
- 이메일: info@eruso.co.kr
- 전화: 1588-0000

---

## 📝 **메모**

**업로드 날짜**: 2026-02-07  
**변경 내용**: 드론 배송 컨셉 이미지 교체  
**핵심 파일**: `about-drone-delivery-city.jpg`, `warehouse-logistics-modern.jpg`  
**예상 효과**: 서비스 컨셉 명확화, 고객 이해도 향상 📦🚁
