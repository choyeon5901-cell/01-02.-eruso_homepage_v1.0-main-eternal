class ApiConfig {
  // API Base URLs
  static const String baseUrl = 'https://www.eruso.co.kr';
  static const String apiUrl = '$baseUrl/api';
  
  // WebSocket URL
  static const String wsUrl = 'wss://www.eruso.co.kr/ws';
  
  // API Endpoints
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authRefresh = '/auth/refresh';
  
  static const String pharmaciesNearby = '/pharmacies/nearby';
  static String pharmacyDetail(String id) => '/pharmacies/$id';
  
  static const String deliveries = '/deliveries';
  static String deliveryDetail(String id) => '/deliveries/$id';
  static String deliveryCancel(String id) => '/deliveries/$id/cancel';
  
  static const String userProfile = '/users/profile';
  static const String userStats = '/users/stats';
  static const String userDeliveries = '/users/deliveries';
  
  static String droneLocation(String droneId) => '/drones/$droneId/location';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // API Keys (환경 변수로 관리 권장)
  static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  static const String firebaseServerKey = 'YOUR_FIREBASE_SERVER_KEY';
}
