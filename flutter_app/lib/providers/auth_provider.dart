import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  String? _userId;
  String? _token;
  Map<String, dynamic>? _user;
  bool _isAuthenticated = false;

  String? get userId => _userId;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _isAuthenticated;

  // 로그인
  Future<void> login(String phone, String password) async {
    try {
      final result = await _apiService.login(phone, password);
      
      _token = result['token'];
      _userId = result['userId'];
      _user = result['user'];
      _isAuthenticated = true;

      // 로컬 저장
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      await prefs.setString('userId', _userId!);
      
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // 회원가입
  Future<void> register({
    required String name,
    required String phone,
    required String email,
    required String password,
    required String address,
  }) async {
    try {
      await _apiService.register(
        name: name,
        phone: phone,
        email: email,
        password: password,
        address: address,
      );
      
      // 회원가입 후 자동 로그인
      await login(phone, password);
    } catch (e) {
      rethrow;
    }
  }

  // 로그아웃
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
    
    _token = null;
    _userId = null;
    _user = null;
    _isAuthenticated = false;
    
    notifyListeners();
  }

  // 토큰 복원
  Future<void> restoreToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _userId = prefs.getString('userId');
    _isAuthenticated = _token != null;
    
    if (_isAuthenticated && _userId != null) {
      try {
        _user = await _apiService.getUserInfo(_userId!);
        notifyListeners();
      } catch (e) {
        await logout();
      }
    }
  }

  // 사용자 정보 업데이트
  Future<void> updateUserInfo(Map<String, dynamic> updates) async {
    if (_userId == null) throw Exception('로그인이 필요합니다');
    
    try {
      await _apiService.updateUserInfo(_userId!, updates);
      _user = {..._user!, ...updates};
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }
}
