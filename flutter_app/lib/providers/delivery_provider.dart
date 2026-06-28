import 'package:flutter/material.dart';
import '../models/delivery.dart';
import '../models/drone_location.dart';
import '../services/delivery_service.dart';
import '../services/websocket_service.dart';

class DeliveryProvider with ChangeNotifier {
  final DeliveryService _deliveryService = DeliveryService();
  final WebSocketService _webSocketService = WebSocketService();

  List<Delivery> _deliveries = [];
  Delivery? _currentDelivery;
  DroneLocation? _currentDroneLocation;
  bool _isLoading = false;
  String? _errorMessage;
  Map<String, dynamic>? _userStats;

  List<Delivery> get deliveries => _deliveries;
  Delivery? get currentDelivery => _currentDelivery;
  DroneLocation? get currentDroneLocation => _currentDroneLocation;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Map<String, dynamic>? get userStats => _userStats;

  List<Delivery> get activeDeliveries =>
      _deliveryService.filterActiveDeliveries(_deliveries);

  List<Delivery> get completedDeliveries =>
      _deliveryService.filterCompletedDeliveries(_deliveries);

  DeliveryProvider() {
    // WebSocket 스트림 리스너 설정
    _webSocketService.locationStream.listen((location) {
      _currentDroneLocation = location;
      notifyListeners();
    });

    _webSocketService.connectionStream.listen((isConnected) {
      if (!isConnected) {
        print('WebSocket disconnected');
      }
      notifyListeners();
    });
  }

  // 배송 생성
  Future<bool> createDelivery({
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
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await _deliveryService.createDelivery(
      pharmacyId: pharmacyId,
      pickupAddress: pickupAddress,
      deliveryAddress: deliveryAddress,
      pickupLatitude: pickupLatitude,
      pickupLongitude: pickupLongitude,
      deliveryLatitude: deliveryLatitude,
      deliveryLongitude: deliveryLongitude,
      medicineList: medicineList,
      totalPrice: totalPrice,
    );

    if (result['success']) {
      _currentDelivery = result['delivery'];
      _deliveries.insert(0, _currentDelivery!);
      
      // 드론이 할당되면 WebSocket 연결
      if (_currentDelivery!.droneId != null) {
        await _webSocketService.connect(_currentDelivery!.droneId!);
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'];
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // 배송 목록 불러오기
  Future<void> loadDeliveries({String? status}) async {
    _isLoading = true;
    notifyListeners();

    final result = await _deliveryService.getUserDeliveries(status: status);

    if (result['success']) {
      _deliveries = result['deliveries'];
    } else {
      _errorMessage = result['message'];
    }

    _isLoading = false;
    notifyListeners();
  }

  // 배송 상세 정보 불러오기
  Future<void> loadDeliveryDetail(String deliveryId) async {
    _isLoading = true;
    notifyListeners();

    final result = await _deliveryService.getDeliveryDetail(deliveryId);

    if (result['success']) {
      _currentDelivery = result['delivery'];
      
      // 드론이 할당되면 WebSocket 연결
      if (_currentDelivery!.droneId != null) {
        await _webSocketService.connect(_currentDelivery!.droneId!);
        _webSocketService.startHeartbeat();
      }
    } else {
      _errorMessage = result['message'];
    }

    _isLoading = false;
    notifyListeners();
  }

  // 배송 취소
  Future<bool> cancelDelivery(String deliveryId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await _deliveryService.cancelDelivery(deliveryId);

    if (result['success']) {
      final cancelledDelivery = result['delivery'];
      final index = _deliveries.indexWhere((d) => d.id == deliveryId);
      if (index != -1) {
        _deliveries[index] = cancelledDelivery;
      }
      
      if (_currentDelivery?.id == deliveryId) {
        _currentDelivery = cancelledDelivery;
        await _webSocketService.disconnect();
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'];
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // 사용자 통계 불러오기
  Future<void> loadUserStats() async {
    final result = await _deliveryService.getUserStats();
    if (result['success']) {
      _userStats = result['stats'];
      notifyListeners();
    }
  }

  // WebSocket 연결 상태 확인
  bool get isWebSocketConnected => _webSocketService.isConnected;

  // WebSocket 수동 연결
  Future<void> connectToDelivery(String droneId) async {
    await _webSocketService.connect(droneId);
  }

  // WebSocket 연결 해제
  Future<void> disconnectWebSocket() async {
    await _webSocketService.disconnect();
    _currentDroneLocation = null;
    notifyListeners();
  }

  // 에러 메시지 초기화
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _webSocketService.dispose();
    super.dispose();
  }
}
