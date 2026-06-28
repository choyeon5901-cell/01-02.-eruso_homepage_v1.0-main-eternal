# 🚁 Flutter 앱 연동 가이드

## 📋 목차
1. [API 엔드포인트](#api-엔드포인트)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [Flutter 연동 코드](#flutter-연동-코드)
4. [인증 시스템](#인증-시스템)
5. [실시간 추적](#실시간-추적)
6. [푸시 알림](#푸시-알림)

---

## 🌐 API 엔드포인트

### Base URL
```
Production: https://www.eruso.co.kr/api
Development: http://localhost:3000/api
```

---

## 📊 데이터베이스 스키마

### 1. 배송 주문 (deliveries)
```javascript
{
  id: string,              // 주문 ID (UUID)
  userId: string,          // 사용자 ID
  pharmacyId: string,      // 약국 ID
  status: string,          // pending, processing, in_transit, delivered, cancelled
  pickupAddress: string,   // 픽업 주소 (약국)
  deliveryAddress: string, // 배송 주소
  latitude: number,        // 배송지 위도
  longitude: number,       // 배송지 경도
  droneId: string,         // 드론 ID
  estimatedTime: number,   // 예상 배송 시간 (분)
  actualTime: number,      // 실제 배송 시간 (분)
  medicineList: array,     // 의약품 목록
  totalPrice: number,      // 총 금액
  createdAt: datetime,     // 주문 생성 시간
  updatedAt: datetime      // 업데이트 시간
}
```

### 2. 사용자 (users)
```javascript
{
  id: string,              // 사용자 ID (UUID)
  name: string,            // 이름
  phone: string,           // 전화번호
  email: string,           // 이메일
  address: string,         // 주소
  latitude: number,        // 위도
  longitude: number,       // 경도
  fcmToken: string,        // FCM 푸시 토큰
  createdAt: datetime      // 가입일
}
```

### 3. 드론 위치 (drone_locations)
```javascript
{
  id: string,              // 위치 ID
  droneId: string,         // 드론 ID
  deliveryId: string,      // 배송 ID
  latitude: number,        // 현재 위도
  longitude: number,       // 현재 경도
  altitude: number,        // 고도 (m)
  speed: number,           // 속도 (km/h)
  battery: number,         // 배터리 (%)
  timestamp: datetime      // 시간
}
```

### 4. 약국 (pharmacies)
```javascript
{
  id: string,              // 약국 ID
  name: string,            // 약국명
  address: string,         // 주소
  phone: string,           // 전화번호
  latitude: number,        // 위도
  longitude: number,       // 경도
  operatingHours: string,  // 운영 시간
  isOpen: boolean          // 영업 중 여부
}
```

---

## 🔌 Flutter 연동 코드

### 1. API Service 클래스

```dart
// lib/services/api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://www.eruso.co.kr/api';
  
  // Headers
  Map<String, String> _headers() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // 1. 배송 주문 생성
  Future<Map<String, dynamic>> createDelivery({
    required String userId,
    required String pharmacyId,
    required String deliveryAddress,
    required double latitude,
    required double longitude,
    required List<Map<String, dynamic>> medicineList,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/deliveries'),
      headers: _headers(),
      body: jsonEncode({
        'userId': userId,
        'pharmacyId': pharmacyId,
        'deliveryAddress': deliveryAddress,
        'latitude': latitude,
        'longitude': longitude,
        'medicineList': medicineList,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('배송 주문 생성 실패: ${response.body}');
    }
  }

  // 2. 배송 상태 조회
  Future<Map<String, dynamic>> getDeliveryStatus(String deliveryId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/deliveries/$deliveryId'),
      headers: _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('배송 상태 조회 실패');
    }
  }

  // 3. 드론 실시간 위치 조회
  Future<Map<String, dynamic>> getDroneLocation(String droneId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/drones/$droneId/location'),
      headers: _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('드론 위치 조회 실패');
    }
  }

  // 4. 사용자 배송 내역 조회
  Future<List<dynamic>> getUserDeliveries(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/$userId/deliveries'),
      headers: _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('배송 내역 조회 실패');
    }
  }

  // 5. 주변 약국 검색
  Future<List<dynamic>> getNearbyPharmacies({
    required double latitude,
    required double longitude,
    double radius = 5.0, // km
  }) async {
    final response = await http.get(
      Uri.parse('$baseUrl/pharmacies/nearby?lat=$latitude&lng=$longitude&radius=$radius'),
      headers: _headers(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('약국 검색 실패');
    }
  }

  // 6. 배송 취소
  Future<void> cancelDelivery(String deliveryId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/deliveries/$deliveryId'),
      headers: _headers(),
    );

    if (response.statusCode != 200) {
      throw Exception('배송 취소 실패');
    }
  }
}
```

---

### 2. 실시간 위치 추적 (WebSocket)

```dart
// lib/services/websocket_service.dart

import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  static const String wsUrl = 'wss://www.eruso.co.kr/ws';
  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _controller;

  // WebSocket 연결
  void connect(String deliveryId) {
    _channel = WebSocketChannel.connect(
      Uri.parse('$wsUrl/delivery/$deliveryId'),
    );

    _controller = StreamController<Map<String, dynamic>>.broadcast();

    _channel!.stream.listen(
      (data) {
        final decodedData = jsonDecode(data);
        _controller!.add(decodedData);
      },
      onError: (error) {
        print('WebSocket 에러: $error');
      },
      onDone: () {
        print('WebSocket 연결 종료');
      },
    );
  }

  // 실시간 위치 스트림
  Stream<Map<String, dynamic>> get locationStream {
    return _controller!.stream;
  }

  // 연결 종료
  void disconnect() {
    _channel?.sink.close();
    _controller?.close();
  }
}
```

---

### 3. 지도 위젯 (Google Maps)

```dart
// lib/widgets/delivery_map.dart

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/websocket_service.dart';

class DeliveryMapWidget extends StatefulWidget {
  final String deliveryId;
  final LatLng destination;

  const DeliveryMapWidget({
    Key? key,
    required this.deliveryId,
    required this.destination,
  }) : super(key: key);

  @override
  State<DeliveryMapWidget> createState() => _DeliveryMapWidgetState();
}

class _DeliveryMapWidgetState extends State<DeliveryMapWidget> {
  GoogleMapController? _mapController;
  final WebSocketService _wsService = WebSocketService();
  final Set<Marker> _markers = {};
  LatLng? _dronePosition;

  @override
  void initState() {
    super.initState();
    _initializeMap();
    _connectWebSocket();
  }

  void _initializeMap() {
    // 목적지 마커 추가
    _markers.add(
      Marker(
        markerId: const MarkerId('destination'),
        position: widget.destination,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        infoWindow: const InfoWindow(title: '배송지'),
      ),
    );
  }

  void _connectWebSocket() {
    _wsService.connect(widget.deliveryId);
    _wsService.locationStream.listen((data) {
      setState(() {
        _dronePosition = LatLng(
          data['latitude'],
          data['longitude'],
        );

        // 드론 마커 업데이트
        _markers.removeWhere((marker) => marker.markerId.value == 'drone');
        _markers.add(
          Marker(
            markerId: const MarkerId('drone'),
            position: _dronePosition!,
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
            infoWindow: InfoWindow(
              title: '드론',
              snippet: '속도: ${data['speed']} km/h, 배터리: ${data['battery']}%',
            ),
          ),
        );

        // 카메라 이동
        _mapController?.animateCamera(
          CameraUpdate.newLatLng(_dronePosition!),
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: widget.destination,
        zoom: 15,
      ),
      markers: _markers,
      onMapCreated: (controller) {
        _mapController = controller;
      },
      myLocationEnabled: true,
      myLocationButtonEnabled: true,
    );
  }

  @override
  void dispose() {
    _wsService.disconnect();
    super.dispose();
  }
}
```

---

### 4. 배송 주문 화면

```dart
// lib/screens/order_screen.dart

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/pharmacy.dart';
import '../models/medicine.dart';

class OrderScreen extends StatefulWidget {
  const OrderScreen({Key? key}) : super(key: key);

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _addressController = TextEditingController();
  
  List<Pharmacy> _pharmacies = [];
  Pharmacy? _selectedPharmacy;
  List<Medicine> _medicines = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadNearbyPharmacies();
  }

  Future<void> _loadNearbyPharmacies() async {
    setState(() => _isLoading = true);
    
    try {
      // 현재 위치 가져오기 (예시)
      double latitude = 36.6201;
      double longitude = 127.2897;

      final data = await _apiService.getNearbyPharmacies(
        latitude: latitude,
        longitude: longitude,
      );

      setState(() {
        _pharmacies = data.map((json) => Pharmacy.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('약국 검색 실패: $e')),
      );
    }
  }

  Future<void> _createOrder() async {
    if (_selectedPharmacy == null || _medicines.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('약국과 의약품을 선택해주세요')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final result = await _apiService.createDelivery(
        userId: 'user_id_here', // 실제 사용자 ID
        pharmacyId: _selectedPharmacy!.id,
        deliveryAddress: _addressController.text,
        latitude: 36.6201,
        longitude: 127.2897,
        medicineList: _medicines.map((m) => m.toJson()).toList(),
      );

      setState(() => _isLoading = false);

      // 배송 추적 화면으로 이동
      Navigator.pushNamed(
        context,
        '/tracking',
        arguments: result['id'],
      );
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('주문 실패: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('약 배송 주문'),
        backgroundColor: const Color(0xFF00C8FF),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 배송 주소
                  TextField(
                    controller: _addressController,
                    decoration: const InputDecoration(
                      labelText: '배송 주소',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.location_on),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 약국 선택
                  const Text(
                    '약국 선택',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  ..._pharmacies.map((pharmacy) => _buildPharmacyCard(pharmacy)),

                  const SizedBox(height: 20),

                  // 의약품 선택 (예시)
                  const Text(
                    '의약품 목록',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  // ... 의약품 선택 UI

                  const SizedBox(height: 30),

                  // 주문 버튼
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _createOrder,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C8FF),
                      ),
                      child: const Text(
                        '주문하기',
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildPharmacyCard(Pharmacy pharmacy) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: const Icon(Icons.local_pharmacy, color: Color(0xFF00C8FF)),
        title: Text(pharmacy.name),
        subtitle: Text(pharmacy.address),
        trailing: Radio<Pharmacy>(
          value: pharmacy,
          groupValue: _selectedPharmacy,
          onChanged: (value) {
            setState(() => _selectedPharmacy = value);
          },
        ),
        onTap: () {
          setState(() => _selectedPharmacy = pharmacy);
        },
      ),
    );
  }
}
```

---

## 📱 푸시 알림 (Firebase Cloud Messaging)

### 1. FCM 설정

```dart
// lib/services/fcm_service.dart

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class FCMService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // FCM 권한 요청
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('푸시 알림 권한 승인됨');
    }

    // FCM 토큰 가져오기
    String? token = await _fcm.getToken();
    print('FCM 토큰: $token');
    // TODO: 토큰을 서버에 전송

    // 로컬 알림 초기화
    const initializationSettingsAndroid = 
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const initializationSettingsIOS = DarwinInitializationSettings();
    const initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    await _localNotifications.initialize(initializationSettings);

    // 포그라운드 메시지 처리
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // 백그라운드 메시지 처리
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('포그라운드 메시지: ${message.notification?.title}');
    
    _showNotification(
      title: message.notification?.title ?? '알림',
      body: message.notification?.body ?? '',
    );
  }

  Future<void> _showNotification({
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'delivery_channel',
      '배송 알림',
      channelDescription: '드론 배송 상태 알림',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      0,
      title,
      body,
      details,
    );
  }
}

// 백그라운드 핸들러 (top-level 함수)
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('백그라운드 메시지: ${message.notification?.title}');
}
```

---

## 🗂️ 데이터 모델

### Pharmacy Model

```dart
// lib/models/pharmacy.dart

class Pharmacy {
  final String id;
  final String name;
  final String address;
  final String phone;
  final double latitude;
  final double longitude;
  final String operatingHours;
  final bool isOpen;

  Pharmacy({
    required this.id,
    required this.name,
    required this.address,
    required this.phone,
    required this.latitude,
    required this.longitude,
    required this.operatingHours,
    required this.isOpen,
  });

  factory Pharmacy.fromJson(Map<String, dynamic> json) {
    return Pharmacy(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      phone: json['phone'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      operatingHours: json['operatingHours'],
      isOpen: json['isOpen'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'phone': phone,
      'latitude': latitude,
      'longitude': longitude,
      'operatingHours': operatingHours,
      'isOpen': isOpen,
    };
  }
}
```

### Delivery Model

```dart
// lib/models/delivery.dart

class Delivery {
  final String id;
  final String userId;
  final String pharmacyId;
  final String status;
  final String deliveryAddress;
  final double latitude;
  final double longitude;
  final String? droneId;
  final int estimatedTime;
  final int? actualTime;
  final List<Medicine> medicineList;
  final double totalPrice;
  final DateTime createdAt;
  final DateTime updatedAt;

  Delivery({
    required this.id,
    required this.userId,
    required this.pharmacyId,
    required this.status,
    required this.deliveryAddress,
    required this.latitude,
    required this.longitude,
    this.droneId,
    required this.estimatedTime,
    this.actualTime,
    required this.medicineList,
    required this.totalPrice,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'],
      userId: json['userId'],
      pharmacyId: json['pharmacyId'],
      status: json['status'],
      deliveryAddress: json['deliveryAddress'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      droneId: json['droneId'],
      estimatedTime: json['estimatedTime'],
      actualTime: json['actualTime'],
      medicineList: (json['medicineList'] as List)
          .map((m) => Medicine.fromJson(m))
          .toList(),
      totalPrice: json['totalPrice'].toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
```

---

## 🔐 인증 시스템

### JWT 토큰 관리

```dart
// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'https://www.eruso.co.kr/api';
  
  // 로그인
  Future<bool> login(String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phone': phone,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveToken(data['token']);
      await _saveUserId(data['userId']);
      return true;
    }
    return false;
  }

  // 회원가입
  Future<bool> register({
    required String name,
    required String phone,
    required String email,
    required String password,
    required String address,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'phone': phone,
        'email': email,
        'password': password,
        'address': address,
      }),
    );

    return response.statusCode == 201;
  }

  // 토큰 저장
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  // 사용자 ID 저장
  Future<void> _saveUserId(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userId', userId);
  }

  // 토큰 가져오기
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // 사용자 ID 가져오기
  Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  // 로그아웃
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
  }
}
```

---

## 📦 pubspec.yaml 의존성

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP 통신
  http: ^1.1.0
  
  # WebSocket
  web_socket_channel: ^2.4.0
  
  # 지도
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  
  # 푸시 알림
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.6
  flutter_local_notifications: ^16.2.0
  
  # 로컬 저장소
  shared_preferences: ^2.2.2
  
  # 상태 관리 (선택사항)
  provider: ^6.1.1
  # 또는
  # bloc: ^8.1.3
  # flutter_bloc: ^8.1.3
```

---

## 🚀 시작하기

### 1. Flutter 프로젝트 생성
```bash
flutter create eruso_app
cd eruso_app
```

### 2. 의존성 추가
```bash
flutter pub add http web_socket_channel google_maps_flutter geolocator
flutter pub add firebase_core firebase_messaging flutter_local_notifications
flutter pub add shared_preferences provider
```

### 3. Firebase 설정
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# FlutterFire CLI 설치
dart pub global activate flutterfire_cli

# Firebase 프로젝트 초기화
flutterfire configure
```

### 4. 앱 실행
```bash
flutter run
```

---

## 📞 문의

**기술 지원**: dev@eruso.co.kr  
**웹사이트**: https://www.eruso.co.kr

---

© 2026 (주)이루소 AI DDS. All rights reserved.
