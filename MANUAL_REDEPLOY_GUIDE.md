# 🚀 Cloudflare Pages 수동 재배포 가이드

## 문제 상황
- ✅ GitHub 저장소에 최신 파일(드론 이미지) 업로드 완료
- ❌ Cloudflare Pages가 자동 배포하지 않음
- ❌ www.eruso.co.kr에 이전 버전 화면 표시

---

## 🎯 해결 방법: 수동 재배포

### **Step 1: Cloudflare Pages 프로젝트로 이동**

1. 현재 화면에서 **eruso** 프로젝트 클릭
   - 또는 직접 URL: https://dash.cloudflare.com/14476e72cc608564aed8277f0b4cbb71/workers-and-pages/view/eruso

---

### **Step 2: 최신 배포 확인**

프로젝트 페이지에서:

1. **"Production"** 탭 확인
2. 최근 배포 목록에서 **커밋 메시지** 확인
   - ❓ "드론 배송 이미지 추가" 커밋이 있나요?
   - ❓ 없다면 → GitHub 자동 배포가 트리거되지 않은 것

---

### **Step 3: 수동 재배포 실행**

#### **방법 A: Retry Deployment (가장 빠름!)**

1. 최근 배포 옆의 **⋮** (점 3개) 클릭
2. **"Retry deployment"** 클릭
3. 1~2분 대기
4. 새 배포가 시작됨 ✅

#### **방법 B: Create New Deployment**

1. 우측 상단 **"Create deployment"** 버튼 클릭
2. **"Connect to Git"** 선택
3. **"Select branch: main"** 선택
4. **"Deploy"** 클릭
5. 빌드 로그 확인 (1~2분 소요)

---

### **Step 4: 배포 완료 확인**

배포가 완료되면:

1. ✅ **"Success"** 메시지 표시
2. 새 배포 URL 확인:
   - https://eruso.pages.dev
   - https://www.eruso.co.kr

---

### **Step 5: 캐시 삭제 (필수!)**

#### **방법 1: Cloudflare 전체 캐시 삭제**

1. 좌측 메뉴에서 **"eruso.co.kr"** 도메인 클릭
   - (Workers & Pages에서 나가기 → Websites → eruso.co.kr)
2. **"Caching"** → **"Configuration"** 클릭
3. **"Purge Everything"** 클릭
4. 확인 팝업에서 **"Purge Everything"** 재클릭
5. ✅ "Cache purged successfully" 메시지 확인

#### **방법 2: 브라우저 강력 새로고침**

- **Windows/Linux:** `Ctrl + Shift + R` 또는 `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

#### **방법 3: 시크릿 모드 테스트**

- **Chrome:** `Ctrl + Shift + N`
- **Edge:** `Ctrl + Shift + N`
- **Firefox:** `Ctrl + Shift + P`

시크릿 모드에서 https://www.eruso.co.kr 접속

---

## 🎯 최종 확인 체크리스트

- [ ] Cloudflare Pages에서 새 배포 시작됨
- [ ] 배포 로그에서 "Success" 확인
- [ ] https://eruso.pages.dev 접속 → 드론 배송 이미지 확인
- [ ] Cloudflare 캐시 Purge Everything 실행
- [ ] 브라우저 Ctrl+F5 (강력 새로고침)
- [ ] 시크릿 모드에서 https://www.eruso.co.kr 접속
- [ ] ✅ **드론 배송 이미지가 정상적으로 보임!**

---

## 📸 배포 후 스크린샷 요청

배포가 완료되면 다음 스크린샷을 공유해주세요:

1. Cloudflare Pages **배포 완료 화면**
   - "Success" 메시지와 배포 URL
2. https://www.eruso.co.kr **About 섹션**
   - 드론 배송 이미지가 표시되는 화면

---

## 🆘 문제 해결

### ❓ "Retry deployment" 버튼이 안 보여요
→ **"Create deployment"** 버튼 사용

### ❓ 배포가 실패했어요 (Build failed)
→ 빌드 로그 확인:
- **"View build log"** 클릭
- 에러 메시지 확인 후 공유

### ❓ 배포 성공했는데도 이전 화면이 보여요
→ 캐시 문제:
1. Cloudflare **Purge Everything**
2. 브라우저 **Ctrl+Shift+Delete** → 전체 캐시 삭제
3. **시크릿 모드**에서 재확인

### ❓ GitHub에서 자동 배포가 안 돼요
→ GitHub Actions 확인:
1. https://github.com/choyeon5901-cell/eruso/actions
2. 최근 워크플로우 실행 내역 확인
3. 실패 시 → Cloudflare Pages 연동 재설정 필요

---

## 📞 지원

문제가 계속되면:
1. Cloudflare Pages 배포 로그 스크린샷
2. 브라우저 개발자 도구 (F12) → Console 탭 스크린샷
3. 에러 메시지 전체 내용

위 정보를 공유해주시면 바로 도와드리겠습니다! 😊
