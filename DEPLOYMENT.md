# 🚀 배포 가이드 - 이룸 AI DDS

## 📋 개요
이룸 AI DDS 조치원 스마트 약배송 시스템 배포 가이드입니다.

---

## 🌐 도메인 정보
- **메인 도메인**: www.eruso.co.kr
- **루트 도메인**: eruso.co.kr

---

## 📦 프로젝트 파일 구조
```
/
├── index.html              # 메인 페이지
├── css/
│   └── style.css          # 스타일시트
├── js/
│   └── main.js           # JavaScript 파일
├── robots.txt            # 검색엔진 크롤러 설정
├── sitemap.xml           # 사이트맵
├── manifest.json         # PWA 매니페스트
├── .htaccess             # Apache 서버 설정
├── README.md             # 프로젝트 문서
└── DEPLOYMENT.md         # 배포 가이드 (이 파일)
```

---

## 🎯 배포 방법

### 방법 1: Publish 탭 사용 (추천)
1. 화면 상단의 **Publish** 탭 클릭
2. 프로젝트 이름 입력 (예: iroom-ai-dds)
3. **Deploy** 버튼 클릭
4. 자동으로 URL 생성됨 (예: https://your-project.pages.dev)

**장점:**
- ✅ 1분 안에 배포 완료
- ✅ 무료 HTTPS 제공
- ✅ 글로벌 CDN 자동 적용
- ✅ 자동 재배포 기능

### 방법 2: Vercel 배포
1. [Vercel](https://vercel.com) 회원가입
2. **New Project** 클릭
3. 프로젝트 파일 업로드 (드래그 & 드롭)
4. **Deploy** 클릭

**설정:**
- Framework Preset: Other
- Build Command: (비워두기)
- Output Directory: (비워두기)

### 방법 3: Netlify 배포
1. [Netlify](https://netlify.com) 회원가입
2. **Add new site** → **Deploy manually**
3. 프로젝트 폴더를 드래그 & 드롭
4. 자동 배포 완료

### 방법 4: 가비아 호스팅
**필요 사항:**
- 가비아 호스팅 상품 (월 990원~)
- FTP 클라이언트 (FileZilla 등)

**배포 단계:**
1. 가비아 호스팅 구매
2. FTP 접속 정보 확인
   - 호스트: ftp.eruso.co.kr
   - 포트: 21 (FTP) 또는 22 (SFTP)
   - 사용자명: [가비아 계정 ID]
   - 비밀번호: [FTP 비밀번호]
3. FTP로 `public_html` 폴더에 파일 업로드
4. 도메인 연결 설정

---

## 🔧 가비아 도메인 연결

### A. Publish/Vercel/Netlify 배포 후 연결
1. 배포 완료 후 URL 확인
2. 가비아 로그인
3. My가비아 → 도메인 관리
4. eruso.co.kr → 관리 클릭
5. DNS 정보 → DNS 관리
6. 레코드 추가:
   ```
   호스트명: www
   타입: CNAME
   값: [배포된 도메인]
   TTL: 3600
   ```
7. 루트 도메인 설정:
   ```
   호스트명: @
   타입: URL 리다이렉트 (301)
   값: https://www.eruso.co.kr
   ```

### B. 가비아 호스팅 사용 시
1. 가비아 호스팅 IP 확인
2. DNS 설정:
   ```
   호스트명: @
   타입: A
   값: [호스팅 IP]
   TTL: 3600

   호스트명: www
   타입: A
   값: [호스팅 IP]
   TTL: 3600
   ```

---

## ⚙️ SSL 인증서 설정

### Publish/Vercel/Netlify
- ✅ 자동으로 무료 SSL 인증서 제공
- ✅ HTTPS 자동 적용

### 가비아 호스팅
1. 가비아 로그인
2. My가비아 → 호스팅 관리
3. SSL 관리 → SSL 인증서 신청
4. Let's Encrypt (무료) 선택
5. 도메인 인증 완료
6. 자동 설치

---

## 🔍 배포 확인 체크리스트

- [ ] 웹사이트 접속 확인
  - [ ] https://www.eruso.co.kr
  - [ ] https://eruso.co.kr (리다이렉트)
- [ ] SSL 인증서 확인 (🔒 자물쇠 아이콘)
- [ ] 모바일 반응형 확인
- [ ] 모든 섹션 정상 작동 확인
  - [ ] 네비게이션 메뉴
  - [ ] 히어로 섹션
  - [ ] 서비스 소개
  - [ ] 주요 기능
  - [ ] 배송 프로세스
  - [ ] 장점
  - [ ] 첨단 기술
  - [ ] 문의 폼
- [ ] 문의 폼 제출 테스트
- [ ] 페이지 로딩 속도 확인 (3초 이내)
- [ ] 콘솔 에러 없음 확인

---

## 📊 SEO 설정

### Google Search Console
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 도메인 추가: www.eruso.co.kr
3. 소유권 인증
4. sitemap.xml 제출: https://www.eruso.co.kr/sitemap.xml

### 네이버 웹마스터도구
1. [네이버 웹마스터도구](https://searchadvisor.naver.com) 접속
2. 사이트 등록: www.eruso.co.kr
3. 사이트 소유 확인
4. sitemap.xml 제출

---

## 🐛 문제 해결

### 접속이 안 될 때
1. DNS 전파 대기 (최대 24~48시간)
2. DNS 확인: [whatsmydns.net](https://whatsmydns.net)
3. 브라우저 캐시 삭제
4. 시크릿 모드로 접속 시도

### 403 Forbidden 에러
1. FTP에서 파일 권한 확인
   - index.html: 644
   - 폴더: 755
2. .htaccess 파일 확인

### 디자인이 깨질 때
1. CSS/JS 파일 경로 확인
2. 파일이 모두 업로드되었는지 확인
3. 브라우저 캐시 삭제

---

## 📞 지원

**문의:**
- 이메일: info@eruso.co.kr
- 전화: 1588-0000

**가비아 고객센터:**
- 전화: 1544-4755 (24시간)
- 웹사이트: [www.gabia.com](https://www.gabia.com)

---

## 📝 업데이트 이력
- 2026-02-05: 초기 배포 가이드 작성
- 도메인: eruso.co.kr로 설정
