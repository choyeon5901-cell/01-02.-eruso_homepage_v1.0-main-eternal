# 📡 이루소 AI DDS API 문서

## 기본 정보

**Base URL**: `https://www.eruso.co.kr/api`  
**API Version**: v1  
**Content-Type**: `application/json`  
**인증 방식**: JWT Bearer Token

---

## 🔐 인증 (Authentication)

### 1. 회원가입
```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "email": "hong@example.com",
  "password": "securepassword123",
  "address": "충청남도 세종특별자치시 조치원읍 조치원로 51"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "userId": "user_abc123",
  "message": "회원가입이 완료되었습니다"
}
```

---

### 2. 로그인
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "phone": "010-1234-5678",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_abc123",
  "user": {
    "id": "user_abc123",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "hong@example.com"
  }
}
```

---

## 🏥 약국 (Pharmacies)

### 1. 주변 약국 검색
```http
GET /api/pharmacies/nearby?lat=36.6201&lng=127.2897&radius=5
```

**Query Parameters**:
- `lat` (required): 위도
- `lng` (required): 경도
- `radius` (optional): 검색 반경 (km, 기본값: 5)

**Response** (200 OK):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "pharmacy_001",
      "name": "조치원세종약국",
      "address": "충청남도 세종특별자치시 조치원읍 조치원로 51",
      "phone": "044-862-1234",
      "latitude": 36.6201,
      "longitude": 127.2897,
      "distance": 0.5,
      "operatingHours": "09:00-22:00",
      "isOpen": true
    }
  ]
}
```

---

### 2. 약국 상세 정보
```http
GET /api/pharmacies/:pharmacyId
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "pharmacy_001",
    "name": "조치원세종약국",
    "address": "충청남도 세종특별자치시 조치원읍 조치원로 51",
    "phone": "044-862-1234",
    "latitude": 36.6201,
    "longitude": 127.2897,
    "operatingHours": "09:00-22:00",
    "isOpen": true,
    "rating": 4.5,
    "reviewCount": 128
  }
}
```

---

## 🚁 배송 (Deliveries)

### 1. 배송 주문 생성
```http
POST /api/deliveries
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "userId": "user_abc123",
  "pharmacyId": "pharmacy_001",
  "deliveryAddress": "충청남도 세종특별자치시 조치원읍 세종로 2060",
  "latitude": 36.6215,
  "longitude": 127.2925,
  "medicineList": [
    {
      "name": "타이레놀",
      "quantity": 2,
      "price": 5000
    },
    {
      "name": "후시딘",
      "quantity": 1,
      "price": 8000
    }
  ],
  "note": "문 앞에 놓아주세요"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "delivery_xyz789",
    "userId": "user_abc123",
    "pharmacyId": "pharmacy_001",
    "status": "pending",
    "pickupAddress": "충청남도 세종특별자치시 조치원읍 조치원로 51",
    "deliveryAddress": "충청남도 세종특별자치시 조치원읍 세종로 2060",
    "latitude": 36.6215,
    "longitude": 127.2925,
    "droneId": null,
    "estimatedTime": 30,
    "medicineList": [
      {
        "name": "타이레놀",
        "quantity": 2,
        "price": 5000
      }
    ],
    "totalPrice": 13000,
    "createdAt": "2026-02-11T12:00:00Z",
    "updatedAt": "2026-02-11T12:00:00Z"
  }
}
```

---

### 2. 배송 상태 조회
```http
GET /api/deliveries/:deliveryId
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "delivery_xyz789",
    "status": "in_transit",
    "droneId": "drone_001",
    "currentLocation": {
      "latitude": 36.6205,
      "longitude": 127.2910,
      "altitude": 50,
      "speed": 25,
      "battery": 85
    },
    "estimatedArrival": "2026-02-11T12:25:00Z",
    "progress": 65
  }
}
```

**배송 상태 값**:
- `pending`: 대기 중
- `processing`: 처리 중 (약국 준비)
- `in_transit`: 배송 중
- `delivered`: 배송 완료
- `cancelled`: 취소됨

---

### 3. 사용자 배송 내역
```http
GET /api/users/:userId/deliveries?page=1&limit=10
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10)
- `status` (optional): 상태 필터 (pending, in_transit, delivered, cancelled)

**Response** (200 OK):
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 25,
  "data": [
    {
      "id": "delivery_xyz789",
      "pharmacyName": "조치원세종약국",
      "status": "delivered",
      "deliveryAddress": "조치원읍 세종로 2060",
      "totalPrice": 13000,
      "createdAt": "2026-02-11T12:00:00Z",
      "deliveredAt": "2026-02-11T12:28:00Z"
    }
  ]
}
```

---

### 4. 배송 취소
```http
DELETE /api/deliveries/:deliveryId
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "배송이 취소되었습니다"
}
```

**Error** (400 Bad Request):
```json
{
  "success": false,
  "error": "이미 배송 중인 주문은 취소할 수 없습니다"
}
```

---

## 🛸 드론 위치 추적 (Drone Tracking)

### 1. 드론 현재 위치
```http
GET /api/drones/:droneId/location
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "droneId": "drone_001",
    "deliveryId": "delivery_xyz789",
    "latitude": 36.6205,
    "longitude": 127.2910,
    "altitude": 50,
    "speed": 25,
    "battery": 85,
    "timestamp": "2026-02-11T12:15:30Z"
  }
}
```

---

### 2. 실시간 위치 추적 (WebSocket)
```
wss://www.eruso.co.kr/ws/delivery/:deliveryId
```

**연결 예시**:
```javascript
const ws = new WebSocket('wss://www.eruso.co.kr/ws/delivery/delivery_xyz789');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('드론 위치:', data);
};
```

**수신 데이터**:
```json
{
  "type": "location_update",
  "deliveryId": "delivery_xyz789",
  "droneId": "drone_001",
  "latitude": 36.6205,
  "longitude": 127.2910,
  "altitude": 50,
  "speed": 25,
  "battery": 85,
  "timestamp": "2026-02-11T12:15:30Z"
}
```

**상태 업데이트**:
```json
{
  "type": "status_update",
  "deliveryId": "delivery_xyz789",
  "status": "in_transit",
  "message": "드론이 배송지로 이동 중입니다",
  "timestamp": "2026-02-11T12:15:00Z"
}
```

---

## 👤 사용자 (Users)

### 1. 사용자 정보 조회
```http
GET /api/users/:userId
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "hong@example.com",
    "address": "충청남도 세종특별자치시 조치원읍 조치원로 51",
    "latitude": 36.6201,
    "longitude": 127.2897,
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

---

### 2. 사용자 정보 수정
```http
PUT /api/users/:userId
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "홍길동",
  "email": "newemail@example.com",
  "address": "새 주소",
  "latitude": 36.6215,
  "longitude": 127.2925
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "사용자 정보가 업데이트되었습니다",
  "data": {
    "id": "user_abc123",
    "name": "홍길동",
    "email": "newemail@example.com"
  }
}
```

---

### 3. FCM 토큰 등록
```http
POST /api/users/:userId/fcm-token
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "fcmToken": "fGH3...xyz"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "FCM 토큰이 등록되었습니다"
}
```

---

## 📊 통계 (Statistics)

### 1. 사용자 통계
```http
GET /api/users/:userId/stats
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalDeliveries": 45,
    "completedDeliveries": 42,
    "cancelledDeliveries": 3,
    "averageDeliveryTime": 28,
    "totalSpent": 567000,
    "favoritePharmacy": {
      "id": "pharmacy_001",
      "name": "조치원세종약국",
      "orderCount": 25
    }
  }
}
```

---

## ⚠️ 에러 코드

### HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 오류 |

### 에러 응답 형식
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": {
    "field": "추가 정보"
  }
}
```

### 에러 코드 목록

| 코드 | 설명 |
|------|------|
| `AUTH_INVALID_TOKEN` | 유효하지 않은 토큰 |
| `AUTH_TOKEN_EXPIRED` | 토큰 만료 |
| `USER_NOT_FOUND` | 사용자 없음 |
| `PHARMACY_NOT_FOUND` | 약국 없음 |
| `DELIVERY_NOT_FOUND` | 배송 정보 없음|
| `DELIVERY_CANNOT_CANCEL` | 배송 취소 불가 |
| `DRONE_NOT_AVAILABLE` | 드론 이용 불가 |
| `INVALID_LOCATION` | 잘못된 위치 정보 |
| `PAYMENT_FAILED` | 결제 실패 |

---

## 🔄 Rate Limiting

- **인증 없는 요청**: 분당 60회
- **인증된 요청**: 분당 300회

**Rate Limit 초과 시 응답**:
```json
{
  "success": false,
  "error": "요청 한도를 초과했습니다",
  "retryAfter": 60
}
```

---

## 📝 예제 코드

### cURL
```bash
# 로그인
curl -X POST https://www.eruso.co.kr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "010-1234-5678",
    "password": "securepassword123"
  }'

# 배송 주문
curl -X POST https://www.eruso.co.kr/api/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user_abc123",
    "pharmacyId": "pharmacy_001",
    "deliveryAddress": "조치원읍 세종로 2060",
    "latitude": 36.6215,
    "longitude": 127.2925,
    "medicineList": [
      {"name": "타이레놀", "quantity": 2, "price": 5000}
    ]
  }'
```

### JavaScript (Fetch)
```javascript
// 로그인
const login = async () => {
  const response = await fetch('https://www.eruso.co.kr/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: '010-1234-5678',
      password: 'securepassword123',
    }),
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// 배송 주문
const createDelivery = async (deliveryData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('https://www.eruso.co.kr/api/deliveries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(deliveryData),
  });
  
  return await response.json();
};
```

---

## 📱 푸시 알림 페이로드

### 배송 상태 업데이트
```json
{
  "notification": {
    "title": "배송 상태 업데이트",
    "body": "드론이 배송지로 이동 중입니다 (65% 완료)"
  },
  "data": {
    "type": "delivery_status",
    "deliveryId": "delivery_xyz789",
    "status": "in_transit",
    "progress": 65
  }
}
```

### 배송 완료
```json
{
  "notification": {
    "title": "배송 완료",
    "body": "주문하신 의약품이 도착했습니다"
  },
  "data": {
    "type": "delivery_completed",
    "deliveryId": "delivery_xyz789",
    "deliveredAt": "2026-02-11T12:28:00Z"
  }
}
```

---

## 🔗 추가 리소스

- **웹사이트**: https://www.eruso.co.kr
- **문의**: api@eruso.co.kr
- **개발자 포럼**: https://forum.eruso.co.kr

---

© 2026 (주)이루소 AI DDS. All rights reserved.
