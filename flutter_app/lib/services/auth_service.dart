import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService {
  static const String baseUrl = 'https://www.eruso.co.kr/api';
  
  // 토큰 저장/불러오기
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // 회원가입
  Future<Map<String, dynamic>> register({
    required String name,
    required String phone,
    required String email,
    required String password,
    required String address,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'phone': phone,
          'email': email,
          'password': password,
          'address': address,
          'latitude': latitude,
          'longitude': longitude,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return {
          'success': true,
          'user': User.fromJson(data['user']),
          'message': '회원가입이 완료되었습니다.',
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? '회원가입에 실패했습니다.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '네트워크 오류가 발생했습니다: $e',
      };
    }
  }

  // 로그인
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return {
          'success': true,
          'user': User.fromJson(data['user']),
          'message': '로그인 성공',
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? '로그인에 실패했습니다.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '네트워크 오류가 발생했습니다: $e',
      };
    }
  }

  // 로그아웃
  Future<void> logout() async {
    await clearToken();
  }

  // 토큰 갱신
  Future<Map<String, dynamic>> refreshToken() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'message': '토큰이 없습니다.'};
      }

      final response = await http.post(
        Uri.parse('$baseUrl/auth/refresh'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return {'success': true};
      } else {
        return {'success': false, 'message': '토큰 갱신 실패'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }

  // 사용자 프로필 조회
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'user': User.fromJson(data),
        };
      } else {
        return {'success': false, 'message': '프로필 조회 실패'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }

  // 사용자 프로필 업데이트
  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phone,
    String? address,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      if (phone != null) body['phone'] = phone;
      if (address != null) body['address'] = address;
      if (latitude != null) body['latitude'] = latitude;
      if (longitude != null) body['longitude'] = longitude;

      final response = await http.patch(
        Uri.parse('$baseUrl/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'user': User.fromJson(data),
          'message': '프로필이 업데이트되었습니다.',
        };
      } else {
        return {'success': false, 'message': '프로필 업데이트 실패'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }

  // FCM 토큰 업데이트
  Future<Map<String, dynamic>> updateFcmToken(String fcmToken) async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final response = await http.patch(
        Uri.parse('$baseUrl/users/fcm-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'fcmToken': fcmToken}),
      );

      if (response.statusCode == 200) {
        return {'success': true};
      } else {
        return {'success': false, 'message': 'FCM 토큰 업데이트 실패'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }
}
