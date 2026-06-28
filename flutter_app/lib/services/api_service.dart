import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/pharmacy.dart';
import '../models/delivery.dart';
import '../models/medicine.dart';

class ApiService {
  static const String baseUrl = 'https://www.eruso.co.kr/api';
  
  // 헤더 생성
  Future<Map<String, String>> _headers() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ===== 인증 =====
  
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'phone': phone,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    } else {
      throw Exception('로그인 실패: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> register({
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

    if (response.statusCode == 201) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    } else {
      throw Exception('회원가입 실패: ${response.body}');
    }
  }

  // ===== 약국 =====
  
  Future<List<Pharmacy>> getNearbyPharmacies({
    required double latitude,
    required double longitude,
    double radius = 5.0,
  }) async {
    final response = await http.get(
      Uri.parse('$baseUrl/pharmacies/nearby?lat=$latitude&lng=$longitude&radius=$radius'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return (data['data'] as List)
          .map((json) => Pharmacy.fromJson(json))
          .toList();
    } else {
      throw Exception('약국 검색 실패');
    }
  }

  Future<Pharmacy> getPharmacyDetails(String pharmacyId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/pharmacies/$pharmacyId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return Pharmacy.fromJson(data['data']);
    } else {
      throw Exception('약국 정보 조회 실패');
    }
  }

  // ===== 배송 =====
  
  Future<Delivery> createDelivery({
    required String userId,
    required String pharmacyId,
    required String deliveryAddress,
    required double latitude,
    required double longitude,
    required List<Medicine> medicineList,
    String? note,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/deliveries'),
      headers: await _headers(),
      body: jsonEncode({
        'userId': userId,
        'pharmacyId': pharmacyId,
        'deliveryAddress': deliveryAddress,
        'latitude': latitude,
        'longitude': longitude,
        'medicineList': medicineList.map((m) => m.toJson()).toList(),
        if (note != null) 'note': note,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return Delivery.fromJson(data['data']);
    } else {
      throw Exception('배송 주문 생성 실패: ${response.body}');
    }
  }

  Future<Delivery> getDeliveryStatus(String deliveryId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/deliveries/$deliveryId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return Delivery.fromJson(data['data']);
    } else {
      throw Exception('배송 상태 조회 실패');
    }
  }

  Future<List<Delivery>> getUserDeliveries(String userId, {
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    var url = '$baseUrl/users/$userId/deliveries?page=$page&limit=$limit';
    if (status != null) {
      url += '&status=$status';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return (data['data'] as List)
          .map((json) => Delivery.fromJson(json))
          .toList();
    } else {
      throw Exception('배송 내역 조회 실패');
    }
  }

  Future<void> cancelDelivery(String deliveryId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/deliveries/$deliveryId'),
      headers: await _headers(),
    );

    if (response.statusCode != 200) {
      throw Exception('배송 취소 실패: ${response.body}');
    }
  }

  // ===== 드론 위치 =====
  
  Future<Map<String, dynamic>> getDroneLocation(String droneId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/drones/$droneId/location'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return data['data'];
    } else {
      throw Exception('드론 위치 조회 실패');
    }
  }

  // ===== 사용자 =====
  
  Future<Map<String, dynamic>> getUserInfo(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/$userId'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return data['data'];
    } else {
      throw Exception('사용자 정보 조회 실패');
    }
  }

  Future<void> updateUserInfo(String userId, Map<String, dynamic> updates) async {
    final response = await http.put(
      Uri.parse('$baseUrl/users/$userId'),
      headers: await _headers(),
      body: jsonEncode(updates),
    );

    if (response.statusCode != 200) {
      throw Exception('사용자 정보 수정 실패');
    }
  }

  Future<void> registerFCMToken(String userId, String fcmToken) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/$userId/fcm-token'),
      headers: await _headers(),
      body: jsonEncode({'fcmToken': fcmToken}),
    );

    if (response.statusCode != 200) {
      throw Exception('FCM 토큰 등록 실패');
    }
  }

  // ===== 통계 =====
  
  Future<Map<String, dynamic>> getUserStats(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/$userId/stats'),
      headers: await _headers(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(utf8.decode(response.bodyBytes));
      return data['data'];
    } else {
      throw Exception('통계 조회 실패');
    }
  }
}
