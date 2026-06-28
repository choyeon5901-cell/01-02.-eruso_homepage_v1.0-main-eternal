import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/delivery.dart';
import 'auth_service.dart';

class DeliveryService {
  static const String baseUrl = 'https://www.eruso.co.kr/api';
  final AuthService _authService = AuthService();

  // 배송 생성
  Future<Map<String, dynamic>> createDelivery({
    required String pharmacyId,
    required String pickupAddress,
    required String deliveryAddress,
    required double pickupLatitude,
    required double pickupLongitude,
    required double deliveryLatitude,
    required double deliveryLongitude,
    required List<Medicine> medicineList,
    required double totalPrice,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final response = await http.post(
        Uri.parse('$baseUrl/deliveries'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'pharmacyId': pharmacyId,
          'pickupAddress': pickupAddress,
          'deliveryAddress': deliveryAddress,
          'pickupLatitude': pickupLatitude,
          'pickupLongitude': pickupLongitude,
          'deliveryLatitude': deliveryLatitude,
          'deliveryLongitude': deliveryLongitude,
          'medicineList': medicineList.map((m) => m.toJson()).toList(),
          'totalPrice': totalPrice,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'delivery': Delivery.fromJson(data),
          'message': '배송 주문이 완료되었습니다.',
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? '배송 주문에 실패했습니다.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '네트워크 오류: $e',
      };
    }
  }

  // 배송 상세 정보
  Future<Map<String, dynamic>> getDeliveryDetail(String deliveryId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/deliveries/$deliveryId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'delivery': Delivery.fromJson(data),
        };
      } else {
        return {'success': false, 'message': '배송 정보를 불러올 수 없습니다.'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }

  // 사용자 배송 목록
  Future<Map<String, dynamic>> getUserDeliveries({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (status != null) 'status': status,
      };

      final uri = Uri.parse('$baseUrl/users/deliveries').replace(
        queryParameters: queryParams,
      );

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final deliveries = (data['data'] as List)
            .map((json) => Delivery.fromJson(json))
            .toList();
        
        return {
          'success': true,
          'deliveries': deliveries,
          'total': data['total'],
          'page': data['page'],
          'limit': data['limit'],
        };
      } else {
        return {'success': false, 'message': '배송 목록을 불러올 수 없습니다.'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }

  // 배송 취소
  Future<Map<String, dynamic>> cancelDelivery(String deliveryId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final response = await http.post(
        Uri.parse('$baseUrl/deliveries/$deliveryId/cancel'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'delivery': Delivery.fromJson(data),
          'message': '배송이 취소되었습니다.',
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? '배송 취소에 실패했습니다.',
        };
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }

  // 활성 배송 필터링
  List<Delivery> filterActiveDeliveries(List<Delivery> deliveries) {
    return deliveries.where((d) => d.isActive).toList();
  }

  // 완료된 배송 필터링
  List<Delivery> filterCompletedDeliveries(List<Delivery> deliveries) {
    return deliveries.where((d) => d.isCompleted).toList();
  }

  // 배송 통계
  Future<Map<String, dynamic>> getUserStats() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': '로그인이 필요합니다.'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/users/stats'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'stats': data,
        };
      } else {
        return {'success': false, 'message': '통계를 불러올 수 없습니다.'};
      }
    } catch (e) {
      return {'success': false, 'message': '네트워크 오류: $e'};
    }
  }
}
