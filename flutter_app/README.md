# 이루소 AI DDS - Flutter 앱

<div align="center">
  <h3>🚁 AI 드론 기반 스마트 약 배송 서비스</h3>
  <p>실시간 드론 추적과 빠른 약 배송을 제공하는 모바일 애플리케이션</p>
</div>

---

## 📱 앱 소개

**이루소 AI DDS**는 인공지능 드론을 활용한 혁신적인 약 배송 서비스입니다. 
주변 약국에서 필요한 약을 주문하고, 드론이 직접 고객의 위치로 신속하고 안전하게 배송합니다.

### 🎯 핵심 기능

#### ✨ 주요 특징
- **📍 실시간 위치 기반 약국 검색** - GPS를 활용한 주변 약국 자동 검색
- **🚁 실시간 드론 추적** - WebSocket 기반 드론 위치 실시간 업데이트
- **📦 간편한 주문 프로세스** - 직관적인 UI로 3단계 주문 완료
- **🔔 푸시 알림** - 주문 상태 변경 시 실시간 알림
- **📊 주문 내역 관리** - 과거 주문 조회 및 재주문 기능
- **🗺️ Google Maps 통합** - 지도에서 약국과 드론 위치 확인

---

## 🏗️ 프로젝트 구조

```
flutter_app/
├── lib/
│   ├── main.dart                    # 앱 진입점
│   ├── config/
│   │   └── api_config.dart          # API 설정
│   ├── theme/
│   │   └── app_theme.dart           # 앱 테마
│   ├── models/                       # 데이터 모델
│   │   ├── user.dart
│   │   ├── pharmacy.dart
│   │   ├── delivery.dart
│   │   └── drone_location.dart
│   ├── services/                     # 비즈니스 로직
│   │   ├── auth_service.dart
│   │   ├── pharmacy_service.dart
│   │   ├── delivery_service.dart
│   │   ├── websocket_service.dart
│   │   └── fcm_service.dart
│   ├── providers/                    # 상태 관리
│   │   ├── auth_provider.dart
│   │   ├── pharmacy_provider.dart
│   │   └── delivery_provider.dart
│   ├── screens/                      # UI 화면
│   │   ├── splash_screen.dart
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── home/
│   │   │   └── home_screen.dart
│   │   ├── order/
│   │   │   └── order_screen.dart
│   │   ├── tracking/
│   │   │   └── tracking_screen.dart
│   │   ├── history/
│   │   │   └── history_screen.dart
│   │   └── profile/
│   │       └── profile_screen.dart
│   └── widgets/                      # 재사용 가능한 위젯
│       ├── pharmacy_card.dart
│       ├── delivery_status_card.dart
│       └── drone_map_widget.dart
├── pubspec.yaml                      # 의존성 관리
└── README.md                         # 프로젝트 문서
```

---

## 🚀 시작하기

### 📋 사전 요구사항

- Flutter SDK 3.0.0 이상
- Dart 3.0.0 이상
- Android Studio / Xcode (플랫폼별)
- Google Maps API 키
- Firebase 프로젝트 설정

### 🔧 설치 방법

#### 1. 저장소 클론
```bash
git clone https://github.com/your-repo/eruso_app.git
cd eruso_app/flutter_app
```

#### 2. 의존성 설치
```bash
flutter pub get
```

#### 3. 환경 설정

**Google Maps API 키 설정:**
```dart
// lib/config/api_config.dart
static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
```

**Firebase 설정:**
```bash
# Android
flutter_app/android/app/google-services.json 파일 추가

# iOS
flutter_app/ios/Runner/GoogleService-Info.plist 파일 추가
```

#### 4. 앱 실행
```bash
# 개발 모드 실행
flutter run

# 릴리즈 빌드
flutter build apk --release  # Android
flutter build ios --release  # iOS
```

---

## 📚 주요 기술 스택

### 🎨 Frontend
- **Flutter** - 크로스 플랫폼 모바일 프레임워크
- **Provider** - 상태 관리
- **Google Maps Flutter** - 지도 통합
- **WebSocket Channel** - 실시간 통신

### 🔌 Backend 통합
- **RESTful API** - HTTP 통신
- **WebSocket** - 실시간 드론 위치 추적
- **Firebase Cloud Messaging** - 푸시 알림

### 📦 주요 패키지

```yaml
dependencies:
  # UI
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # 네트워크
  http: ^1.1.0
  dio: ^5.4.0
  web_socket_channel: ^2.4.0
  
  # 지도 & 위치
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  
  # 상태 관리
  provider: ^6.1.1
  
  # 로컬 저장소
  shared_preferences: ^2.2.2
  
  # 푸시 알림
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.6
  flutter_local_notifications: ^16.2.0
  
  # 유틸리티
  intl: ^0.18.1
  url_launcher: ^6.2.2
  permission_handler: ^11.1.0
```

---

## 🎨 화면 구성

### 1. 로그인/회원가입 화면
- 이메일/비밀번호 로그인
- 소셜 로그인 (Google, Kakao)
- 회원가입 폼

### 2. 홈 화면
- 현재 활성 배송 상태
- 사용자 통계 (총 주문, 이번 달 주문, 포인트)
- 주변 약국 목록 (거리순 정렬)
- 영업중/전체 약국 필터

### 3. 주문 화면
- 약국 선택
- 약품 선택 및 수량 입력
- 배송지 설정
- 결제 정보 입력

### 4. 배송 추적 화면
- 실시간 드론 위치 지도
- 배송 진행 상태
- 예상 도착 시간
- 드론 정보 (배터리, 고도, 속도)

### 5. 주문 내역 화면
- 과거 주문 목록
- 주문 상세 정보
- 재주문 기능

### 6. 마이페이지
- 사용자 프로필
- 배송지 관리
- 결제 수단 관리
- 알림 설정
- 고객센터

---

## 🔗 API 통합

### API 엔드포인트

```
Base URL: https://www.eruso.co.kr/api
WebSocket: wss://www.eruso.co.kr/ws
```

#### 인증 API
```
POST   /auth/register      # 회원가입
POST   /auth/login         # 로그인
POST   /auth/refresh       # 토큰 갱신
```

#### 약국 API
```
GET    /pharmacies/nearby  # 주변 약국 검색
GET    /pharmacies/:id     # 약국 상세 정보
```

#### 배송 API
```
POST   /deliveries         # 배송 생성
GET    /deliveries/:id     # 배송 상세 정보
GET    /users/deliveries   # 사용자 배송 목록
POST   /deliveries/:id/cancel  # 배송 취소
```

#### 사용자 API
```
GET    /users/profile      # 프로필 조회
PATCH  /users/profile      # 프로필 업데이트
GET    /users/stats        # 사용자 통계
PATCH  /users/fcm-token    # FCM 토큰 업데이트
```

#### WebSocket
```
ws://server/ws/drones/:droneId  # 드론 위치 실시간 구독
```

---

## 🔔 푸시 알림

### FCM 알림 유형

- **주문 확인**: 주문이 접수되었을 때
- **약 준비 완료**: 약국에서 약 준비가 완료되었을 때
- **배송 시작**: 드론이 출발했을 때
- **배송 완료**: 배송이 완료되었을 때
- **배송 취소**: 배송이 취소되었을 때

---

## 🔒 권한 요청

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
```

### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>주변 약국을 찾기 위해 위치 권한이 필요합니다.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>배송 상태를 추적하기 위해 위치 권한이 필요합니다.</string>
```

---

## 🐛 디버깅

### 로그 확인
```bash
# Flutter 로그
flutter logs

# Android 로그
adb logcat

# iOS 로그
xcrun simctl spawn booted log stream --predicate 'processImagePath endswith "Runner"'
```

### 네트워크 디버깅
- **Charles Proxy** 또는 **Proxyman** 사용
- API 요청/응답 모니터링

---

## 🎨 UI/UX 가이드

### 컬러 팔레트
```dart
Primary Color:   #00C8FF (시안 블루)
Secondary Color: #FF6B35 (오렌지)
Success Color:   #00C853 (그린)
Warning Color:   #FFB800 (옐로우)
Error Color:     #FF3D00 (레드)
```

### 타이포그래피
- **제목**: Noto Sans KR Bold
- **본문**: Noto Sans KR Regular
- **강조**: Noto Sans KR Medium

---

## 📈 성능 최적화

### 이미지 최적화
- `cached_network_image` 패키지 사용
- 썸네일 이미지 미리 로드
- 이미지 캐싱 전략

### 네트워크 최적화
- API 요청 최소화
- 로컬 캐싱 활용
- WebSocket 연결 재사용

### 배터리 최적화
- 백그라운드 위치 업데이트 최소화
- 불필요한 센서 사용 제한

---

## 🧪 테스트

### 단위 테스트
```bash
flutter test
```

### 통합 테스트
```bash
flutter drive --target=test_driver/app.dart
```

### 위젯 테스트
```bash
flutter test test/widget_test.dart
```

---

## 📦 배포

### Android 배포
```bash
# APK 빌드
flutter build apk --release

# App Bundle 빌드 (Google Play 권장)
flutter build appbundle --release
```

### iOS 배포
```bash
# Archive 빌드
flutter build ios --release

# Xcode에서 Archive 및 업로드
open ios/Runner.xcworkspace
```

---

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 📞 문의

- **개발 문의**: dev@eruso.co.kr
- **API 문의**: api@eruso.co.kr
- **웹사이트**: https://www.eruso.co.kr

---

## 🗓️ 업데이트 로그

### v1.0.0 (2026-02-11)
- ✅ 기본 앱 구조 및 설정 완료
- ✅ 데이터 모델 클래스 구현 (User, Pharmacy, Delivery, DroneLocation)
- ✅ API 서비스 레이어 구현 (Auth, Pharmacy, Delivery)
- ✅ WebSocket 실시간 위치 추적 서비스
- ✅ Provider 상태 관리 (Auth, Pharmacy, Delivery)
- ✅ 주요 UI 화면 구현 (홈, 주문, 추적, 프로필)
- ✅ Google Maps 통합
- ✅ FCM 푸시 알림
- ✅ 완전한 문서화

### 다음 업데이트 예정
- 🔄 소셜 로그인 (Google, Kakao)
- 🔄 결제 시스템 통합
- 🔄 포인트/쿠폰 시스템
- 🔄 리뷰/평점 기능
- 🔄 다국어 지원

---

<div align="center">
  <p>Made with ❤️ by (주)이루소 Team</p>
  <p>© 2026 이루소 AI DDS. All rights reserved.</p>
</div>
