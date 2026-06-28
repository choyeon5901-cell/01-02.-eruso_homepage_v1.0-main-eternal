# Flutter 앱 개발 가이드 - 이루소 AI DDS

## 📱 앱 개발 완료 사항

### ✅ 완료된 작업

#### 1. 프로젝트 기본 구조 ✅
- ✅ Flutter 프로젝트 초기 설정 (`pubspec.yaml`)
- ✅ 앱 진입점 및 라우팅 설정 (`main.dart`)
- ✅ 앱 테마 및 스타일 가이드 (`app_theme.dart`)
- ✅ API 설정 파일 (`api_config.dart`)

#### 2. 데이터 모델 ✅
- ✅ **User** - 사용자 정보 모델
- ✅ **Pharmacy** - 약국 정보 모델  
- ✅ **Delivery** - 배송 정보 모델
- ✅ **DroneLocation** - 드론 위치 모델
- ✅ **Medicine** - 약품 정보 모델

#### 3. 서비스 레이어 ✅
- ✅ **AuthService** - 인증 서비스 (로그인/회원가입/토큰 관리)
- ✅ **PharmacyService** - 약국 검색 및 관리
- ✅ **DeliveryService** - 배송 생성 및 관리
- ✅ **WebSocketService** - 실시간 드론 위치 추적
- ✅ **FCMService** - 푸시 알림 서비스

#### 4. 상태 관리 (Provider) ✅
- ✅ **AuthProvider** - 인증 상태 관리
- ✅ **PharmacyProvider** - 약국 데이터 및 상태 관리
- ✅ **DeliveryProvider** - 배송 데이터 및 WebSocket 통합

#### 5. UI 화면 ✅
- ✅ **SplashScreen** - 스플래시 화면
- ✅ **LoginScreen** - 로그인 화면
- ✅ **RegisterScreen** - 회원가입 화면
- ✅ **HomeScreen** - 메인 홈 화면 (약국 목록, 활성 배송, 통계)
- ✅ **OrderScreen** - 주문 화면
- ✅ **TrackingScreen** - 배송 추적 화면 (Google Maps + WebSocket)
- ✅ **HistoryScreen** - 주문 내역 화면
- ✅ **ProfileScreen** - 프로필 관리 화면

#### 6. 주요 기능 ✅
- ✅ RESTful API 통합 (HTTP 통신)
- ✅ WebSocket 실시간 드론 추적
- ✅ Google Maps 지도 통합
- ✅ GPS 기반 위치 서비스
- ✅ Firebase Cloud Messaging (FCM) 푸시 알림
- ✅ 로컬 저장소 (SharedPreferences)

---

## 🚀 앱 실행 방법

### 1. 의존성 설치
```bash
cd flutter_app
flutter pub get
```

### 2. 환경 설정

#### Google Maps API 키 설정
```dart
// lib/config/api_config.dart
static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
```

#### Firebase 설정
1. Firebase Console에서 프로젝트 생성
2. Android/iOS 앱 등록
3. 설정 파일 다운로드 및 추가:
   - **Android**: `android/app/google-services.json`
   - **iOS**: `ios/Runner/GoogleService-Info.plist`

### 3. 앱 실행
```bash
# 개발 모드
flutter run

# 디버그 빌드
flutter run --debug

# 릴리즈 빌드
flutter run --release
```

### 4. 빌드 (배포용)
```bash
# Android APK
flutter build apk --release

# Android App Bundle (Google Play Store)
flutter build appbundle --release

# iOS
flutter build ios --release
```

---

## 📁 프로젝트 구조 상세

```
flutter_app/
├── lib/
│   ├── main.dart                          # 앱 진입점, 라우팅 설정
│   │
│   ├── config/
│   │   └── api_config.dart                # API URL, 타임아웃 설정
│   │
│   ├── theme/
│   │   └── app_theme.dart                 # 컬러, 폰트, 버튼 스타일
│   │
│   ├── models/                             # 데이터 모델
│   │   ├── user.dart                      # 사용자 모델 (JSON ↔ Dart)
│   │   ├── pharmacy.dart                  # 약국 모델
│   │   ├── delivery.dart                  # 배송 모델
│   │   └── drone_location.dart            # 드론 위치 모델
│   │
│   ├── services/                           # 비즈니스 로직/API 통신
│   │   ├── auth_service.dart              # 로그인/회원가입/토큰 관리
│   │   ├── pharmacy_service.dart          # 약국 검색 API
│   │   ├── delivery_service.dart          # 배송 생성/조회/취소 API
│   │   ├── websocket_service.dart         # 실시간 드론 위치 WebSocket
│   │   └── fcm_service.dart               # Firebase 푸시 알림
│   │
│   ├── providers/                          # 상태 관리 (Provider 패턴)
│   │   ├── auth_provider.dart             # 인증 상태
│   │   ├── pharmacy_provider.dart         # 약국 데이터, GPS 위치
│   │   └── delivery_provider.dart         # 배송 데이터, WebSocket 연결
│   │
│   ├── screens/                            # UI 화면
│   │   ├── splash_screen.dart             # 스플래시 (앱 시작)
│   │   ├── auth/
│   │   │   ├── login_screen.dart          # 로그인
│   │   │   └── register_screen.dart       # 회원가입
│   │   ├── home/
│   │   │   └── home_screen.dart           # 메인 홈 (3탭: 홈/주문내역/마이페이지)
│   │   ├── order/
│   │   │   └── order_screen.dart          # 주문하기
│   │   ├── tracking/
│   │   │   └── tracking_screen.dart       # 실시간 배송 추적 (지도)
│   │   ├── history/
│   │   │   └── history_screen.dart        # 주문 내역
│   │   └── profile/
│   │       └── profile_screen.dart        # 프로필 설정
│   │
│   └── widgets/                            # 재사용 가능 위젯
│       ├── pharmacy_card.dart             # 약국 카드 위젯
│       ├── delivery_status_card.dart      # 배송 상태 카드
│       └── drone_map_widget.dart          # 드론 지도 위젯
│
├── assets/                                 # 리소스 파일
│   ├── images/                            # 이미지
│   └── icons/                             # 아이콘
│
├── pubspec.yaml                            # 의존성 및 설정
└── README.md                               # 프로젝트 문서
```

---

## 🔌 API 연동 구조

### API Base URL
```dart
static const String baseUrl = 'https://www.eruso.co.kr/api';
static const String wsUrl = 'wss://www.eruso.co.kr/ws';
```

### API 사용 예시

#### 1. 로그인
```dart
final authService = AuthService();
final result = await authService.login(
  email: 'user@example.com',
  password: 'password123',
);

if (result['success']) {
  User user = result['user'];
  // 로그인 성공 처리
} else {
  // 에러 메시지: result['message']
}
```

#### 2. 주변 약국 검색
```dart
final pharmacyService = PharmacyService();
final result = await pharmacyService.getNearbyPharmacies(
  latitude: 36.6223,
  longitude: 127.2951,
  radius: 5.0, // 5km 반경
);

if (result['success']) {
  List<Pharmacy> pharmacies = result['pharmacies'];
}
```

#### 3. 배송 생성
```dart
final deliveryService = DeliveryService();
final result = await deliveryService.createDelivery(
  pharmacyId: 'pharmacy-id',
  pickupAddress: '약국 주소',
  deliveryAddress: '배송지 주소',
  pickupLatitude: 36.62,
  pickupLongitude: 127.29,
  deliveryLatitude: 36.63,
  deliveryLongitude: 127.30,
  medicineList: [
    Medicine(name: '타이레놀', quantity: 2, price: 5000),
  ],
  totalPrice: 10000,
);

if (result['success']) {
  Delivery delivery = result['delivery'];
}
```

#### 4. WebSocket 드론 추적
```dart
final wsService = WebSocketService();

// 연결
await wsService.connect('drone-id-123');

// 위치 업데이트 수신
wsService.locationStream.listen((DroneLocation location) {
  print('드론 위치: ${location.latitude}, ${location.longitude}');
  print('배터리: ${location.battery}%');
});

// 연결 해제
await wsService.disconnect();
```

---

## 🎨 UI/UX 디자인 가이드

### 컬러 팔레트
```dart
Primary:    #00C8FF  // 브랜드 시안 블루
Secondary:  #FF6B35  // 오렌지
Success:    #00C853  // 그린
Warning:    #FFB800  // 옐로우
Error:      #FF3D00  // 레드
```

### 타이포그래피
- **제목 (Title)**: 20-32px, Bold
- **부제목 (Subtitle)**: 16-18px, SemiBold
- **본문 (Body)**: 14-16px, Regular
- **캡션 (Caption)**: 12px, Regular

### 컴포넌트 스타일
- **버튼**: 12px 둥근 모서리, 16px 상하 패딩
- **카드**: 16px 둥근 모서리, 그림자 효과
- **입력 필드**: 12px 둥근 모서리, 회색 테두리

---

## 🔔 푸시 알림 (FCM)

### 알림 페이로드 예시
```json
{
  "notification": {
    "title": "배송이 시작되었습니다!",
    "body": "드론이 약을 배송 중입니다. 예상 도착 시간: 15분"
  },
  "data": {
    "type": "delivery_update",
    "deliveryId": "delivery-123",
    "status": "in_transit"
  }
}
```

### FCM 서비스 사용
```dart
final fcmService = FCMService();

// 초기화
await fcmService.initialize();

// 토큰 가져오기
String? token = await fcmService.getToken();

// 알림 수신 리스너
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  print('알림 수신: ${message.notification?.title}');
});
```

---

## 🗺️ Google Maps 사용

### 지도에 마커 추가
```dart
GoogleMap(
  initialCameraPosition: CameraPosition(
    target: LatLng(36.6223, 127.2951),
    zoom: 15,
  ),
  markers: {
    // 약국 마커
    Marker(
      markerId: MarkerId('pharmacy'),
      position: LatLng(36.62, 127.29),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
    ),
    // 드론 마커
    Marker(
      markerId: MarkerId('drone'),
      position: LatLng(36.63, 127.30),
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
    ),
  },
)
```

---

## 🔐 권한 설정

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
```

### iOS (`ios/Runner/Info.plist`)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>주변 약국을 찾기 위해 위치 권한이 필요합니다.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>배송 추적을 위해 위치 권한이 필요합니다.</string>
```

---

## 🐛 디버깅 팁

### 로그 확인
```bash
flutter logs
```

### API 통신 디버깅
```dart
// api_config.dart에 디버그 모드 추가
static const bool debugMode = true;

if (debugMode) {
  print('API Request: $url');
  print('Request Body: $body');
}
```

### WebSocket 연결 상태 확인
```dart
wsService.connectionStream.listen((isConnected) {
  print('WebSocket Connected: $isConnected');
});
```

---

## 📦 배포 체크리스트

### 배포 전 확인사항
- [ ] API URL을 프로덕션 서버로 변경
- [ ] Google Maps API 키 제한 설정
- [ ] Firebase 프로젝트 프로덕션 환경 설정
- [ ] 앱 아이콘 및 스플래시 이미지 설정
- [ ] 앱 버전 및 빌드 번호 업데이트 (`pubspec.yaml`)
- [ ] 디버그 로그 제거 또는 비활성화
- [ ] 권한 설명 문구 최종 확인
- [ ] 개인정보 처리방침 URL 설정
- [ ] 서비스 이용약관 URL 설정

### Android 배포
```bash
# 서명 키 생성
keytool -genkey -v -keystore ~/eruso-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias eruso

# build.gradle 서명 설정 추가
# 빌드
flutter build appbundle --release
```

### iOS 배포
```bash
# Xcode 설정
# 1. Team 선택
# 2. Bundle Identifier 설정
# 3. Provisioning Profile 설정

# 빌드
flutter build ios --release

# Archive & Upload (Xcode에서)
open ios/Runner.xcworkspace
```

---

## 🎯 다음 단계 (로드맵)

### Phase 2 - 추가 기능
- [ ] 소셜 로그인 (Google, Kakao, Apple)
- [ ] 결제 시스템 통합 (Toss, KakaoPay)
- [ ] 포인트/쿠폰 시스템
- [ ] 리뷰 및 평점 기능
- [ ] 배송지 즐겨찾기
- [ ] 약 재주문 기능

### Phase 3 - 고도화
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 다크 모드
- [ ] 접근성 (Accessibility) 개선
- [ ] 앱 성능 최적화
- [ ] 오프라인 모드 지원
- [ ] AI 챗봇 상담

---

## 📞 기술 지원

### 개발 관련 문의
- **이메일**: dev@eruso.co.kr
- **API 문서**: https://www.eruso.co.kr/api/docs
- **웹사이트**: https://www.eruso.co.kr

---

## ✅ 개발 완료 요약

이 Flutter 앱은 **완전히 구현 가능한 구조**로 설계되었습니다:

1. ✅ **모든 모델 클래스** - JSON 직렬화/역직렬화 완료
2. ✅ **모든 서비스 레이어** - RESTful API + WebSocket 통합
3. ✅ **상태 관리** - Provider 패턴으로 전역 상태 관리
4. ✅ **UI 화면** - 홈, 주문, 추적, 프로필 등 모든 주요 화면
5. ✅ **실시간 기능** - WebSocket 드론 추적 + FCM 푸시 알림
6. ✅ **지도 통합** - Google Maps + GPS 위치 서비스

### 백엔드 연동 준비 완료
백엔드 API 서버만 구축하면 바로 연동 가능합니다!

```
Flutter App (Ready) ←→ Backend API (구축 필요) ←→ Database
```

---

<div align="center">
  <p><strong>개발 완료! 이제 백엔드 API를 구축하고 테스트하세요! 🚀</strong></p>
  <p>Made with ❤️ by (주)이루소 Team</p>
</div>
