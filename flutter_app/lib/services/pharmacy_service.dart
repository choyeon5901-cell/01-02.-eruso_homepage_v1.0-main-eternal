import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/pharmacy.dart';
import 'auth_service.dart';

class PharmacyService {
  static const String baseUrl = 'https://www.eruso.co.kr/api';
  final AuthService _authService = AuthService();

  // 주변 약국 검색
  Future<Map<String, dynamic>> getNearbyPharmacies({
    required double latitude,
    required double longitude,
    double radius = 5.0, // 반경 (km)
  }) async {
    try {
      final token = await _authService.getToken();
      
      final uri = Uri.parse('$baseUrl/pharmacies/nearby').replace(
        queryParameters: {
          'latitude': latitude.toString(),
          'longitude': longitude.toString(),
          'radius': radius.toString(),
        },
      );

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final pharmacies = (data['pharmacies'] as List)
            .map((json) => Pharmacy.fromJson(json))
            .toList();
        
        return {
          'success': true,
          'pharmacies': pharmacies,
        };
      } else {
        return {
          'success': false,
          'message': '약국 검색에 실패했습니다.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '네트워크 오류: $e',
      };
    }
  }

  // 약국 상세 정보
  Future<Map<String, dynamic>> getPharmacyDetail(String pharmacyId) async {
    try {
      final token = await _authService.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/pharmacies/$pharmacyId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'pharmacy': Pharmacy.fromJson(data),
        };
      } else {
        return {
          'success': false,
          'message': '약국 정보를 불러올 수 없습니다.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '네트워크 오류: $e',
      };
    }
  }

  // 영업중인 약국 필터링
  List<Pharmacy> filterOpenPharmacies(List<Pharmacy> pharmacies) {
    return pharmacies.where((p) => p.isCurrentlyOpen()).toList();
  }

  // 거리순 정렬
  List<Pharmacy> sortByDistance(List<Pharmacy> pharmacies) {
    final sorted = List<Pharmacy>.from(pharmacies);
    sorted.sort((a, b) {
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance!.compareTo(b.distance!);
    });
    return sorted;
  }
}
