import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/pharmacy.dart';
import '../services/pharmacy_service.dart';

class PharmacyProvider with ChangeNotifier {
  final PharmacyService _pharmacyService = PharmacyService();

  List<Pharmacy> _pharmacies = [];
  Pharmacy? _selectedPharmacy;
  Position? _currentPosition;
  bool _isLoading = false;
  String? _errorMessage;
  bool _showOpenOnly = false;

  List<Pharmacy> get pharmacies => _pharmacies;
  Pharmacy? get selectedPharmacy => _selectedPharmacy;
  Position? get currentPosition => _currentPosition;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get showOpenOnly => _showOpenOnly;

  List<Pharmacy> get filteredPharmacies {
    if (_showOpenOnly) {
      return _pharmacyService.filterOpenPharmacies(_pharmacies);
    }
    return _pharmacies;
  }

  // 현재 위치 가져오기
  Future<bool> getCurrentLocation() async {
    try {
      // 위치 권한 확인
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _errorMessage = '위치 권한이 거부되었습니다.';
          notifyListeners();
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _errorMessage = '위치 권한이 영구적으로 거부되었습니다. 설정에서 권한을 허용해주세요.';
        notifyListeners();
        return false;
      }

      // 현재 위치 가져오기
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = '위치를 가져올 수 없습니다: $e';
      notifyListeners();
      return false;
    }
  }

  // 주변 약국 검색
  Future<void> searchNearbyPharmacies({double radius = 5.0}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    // 현재 위치가 없으면 먼저 가져오기
    if (_currentPosition == null) {
      final success = await getCurrentLocation();
      if (!success) {
        _isLoading = false;
        notifyListeners();
        return;
      }
    }

    final result = await _pharmacyService.getNearbyPharmacies(
      latitude: _currentPosition!.latitude,
      longitude: _currentPosition!.longitude,
      radius: radius,
    );

    if (result['success']) {
      _pharmacies = result['pharmacies'];
      // 거리순으로 정렬
      _pharmacies = _pharmacyService.sortByDistance(_pharmacies);
    } else {
      _errorMessage = result['message'];
    }

    _isLoading = false;
    notifyListeners();
  }

  // 약국 상세 정보 불러오기
  Future<void> loadPharmacyDetail(String pharmacyId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await _pharmacyService.getPharmacyDetail(pharmacyId);

    if (result['success']) {
      _selectedPharmacy = result['pharmacy'];
    } else {
      _errorMessage = result['message'];
    }

    _isLoading = false;
    notifyListeners();
  }

  // 약국 선택
  void selectPharmacy(Pharmacy pharmacy) {
    _selectedPharmacy = pharmacy;
    notifyListeners();
  }

  // 약국 선택 해제
  void clearSelectedPharmacy() {
    _selectedPharmacy = null;
    notifyListeners();
  }

  // 영업중인 약국만 표시 토글
  void toggleShowOpenOnly() {
    _showOpenOnly = !_showOpenOnly;
    notifyListeners();
  }

  // 에러 메시지 초기화
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // 수동으로 위치 설정 (테스트용)
  void setManualPosition(double latitude, double longitude) {
    _currentPosition = Position(
      latitude: latitude,
      longitude: longitude,
      timestamp: DateTime.now(),
      accuracy: 0,
      altitude: 0,
      heading: 0,
      speed: 0,
      speedAccuracy: 0,
      altitudeAccuracy: 0,
      headingAccuracy: 0,
    );
    notifyListeners();
  }
}
