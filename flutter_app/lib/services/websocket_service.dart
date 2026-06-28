import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/drone_location.dart';

class WebSocketService {
  static const String wsUrl = 'wss://www.eruso.co.kr/ws';
  
  WebSocketChannel? _channel;
  final _locationController = StreamController<DroneLocation>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();
  
  Stream<DroneLocation> get locationStream => _locationController.stream;
  Stream<bool> get connectionStream => _connectionController.stream;
  
  bool _isConnected = false;
  String? _currentDroneId;
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int maxReconnectAttempts = 5;

  bool get isConnected => _isConnected;
  String? get currentDroneId => _currentDroneId;

  // WebSocket 연결
  Future<void> connect(String droneId, {String? token}) async {
    if (_isConnected && _currentDroneId == droneId) {
      print('WebSocket already connected to drone: $droneId');
      return;
    }

    try {
      await disconnect();
      
      _currentDroneId = droneId;
      
      // WebSocket URL 구성
      var url = '$wsUrl/drones/$droneId';
      if (token != null) {
        url += '?token=$token';
      }

      print('Connecting to WebSocket: $url');
      
      _channel = WebSocketChannel.connect(Uri.parse(url));
      
      // 연결 성공
      _isConnected = true;
      _reconnectAttempts = 0;
      _connectionController.add(true);
      print('WebSocket connected successfully');

      // 메시지 수신 리스너
      _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onError: (error) {
          print('WebSocket error: $error');
          _handleDisconnect();
        },
        onDone: () {
          print('WebSocket connection closed');
          _handleDisconnect();
        },
        cancelOnError: false,
      );

      // 초기 연결 메시지 전송
      sendMessage({
        'type': 'subscribe',
        'droneId': droneId,
      });
    } catch (e) {
      print('WebSocket connection failed: $e');
      _handleDisconnect();
    }
  }

  // 메시지 처리
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      
      switch (data['type']) {
        case 'location_update':
          final location = DroneLocation.fromJson(data['data']);
          _locationController.add(location);
          break;
          
        case 'status_update':
          print('Drone status update: ${data['data']}');
          break;
          
        case 'error':
          print('WebSocket error message: ${data['message']}');
          break;
          
        default:
          print('Unknown message type: ${data['type']}');
      }
    } catch (e) {
      print('Error parsing WebSocket message: $e');
    }
  }

  // 메시지 전송
  void sendMessage(Map<String, dynamic> message) {
    if (_isConnected && _channel != null) {
      try {
        _channel!.sink.add(jsonEncode(message));
      } catch (e) {
        print('Error sending WebSocket message: $e');
      }
    } else {
      print('WebSocket not connected, cannot send message');
    }
  }

  // 연결 끊김 처리
  void _handleDisconnect() {
    _isConnected = false;
    _connectionController.add(false);
    
    // 자동 재연결 시도
    if (_reconnectAttempts < maxReconnectAttempts && _currentDroneId != null) {
      _reconnectAttempts++;
      final delay = Duration(seconds: _reconnectAttempts * 2);
      
      print('Attempting to reconnect in ${delay.inSeconds} seconds... (Attempt $_reconnectAttempts/$maxReconnectAttempts)');
      
      _reconnectTimer?.cancel();
      _reconnectTimer = Timer(delay, () {
        if (_currentDroneId != null) {
          connect(_currentDroneId!);
        }
      });
    } else {
      print('Max reconnect attempts reached or no drone ID');
    }
  }

  // 연결 종료
  Future<void> disconnect() async {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _reconnectAttempts = 0;
    
    if (_channel != null) {
      try {
        // 연결 종료 메시지 전송
        if (_isConnected) {
          sendMessage({
            'type': 'unsubscribe',
            'droneId': _currentDroneId,
          });
        }
        
        await _channel!.sink.close();
      } catch (e) {
        print('Error closing WebSocket: $e');
      }
      _channel = null;
    }
    
    _isConnected = false;
    _currentDroneId = null;
    _connectionController.add(false);
    print('WebSocket disconnected');
  }

  // 리소스 정리
  void dispose() {
    disconnect();
    _locationController.close();
    _connectionController.close();
  }

  // Ping/Pong으로 연결 유지
  void startHeartbeat() {
    Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_isConnected) {
        sendMessage({'type': 'ping'});
      } else {
        timer.cancel();
      }
    });
  }
}
