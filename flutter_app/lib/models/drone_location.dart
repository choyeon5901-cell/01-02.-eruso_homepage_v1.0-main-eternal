class DroneLocation {
  final String id;
  final String droneId;
  final String? deliveryId;
  final double latitude;
  final double longitude;
  final double altitude; // 고도 (미터)
  final double speed; // 속도 (km/h)
  final int battery; // 배터리 (%)
  final DateTime timestamp;

  DroneLocation({
    required this.id,
    required this.droneId,
    this.deliveryId,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.speed,
    required this.battery,
    required this.timestamp,
  });

  factory DroneLocation.fromJson(Map<String, dynamic> json) {
    return DroneLocation(
      id: json['id'],
      droneId: json['droneId'],
      deliveryId: json['deliveryId'],
      latitude: double.parse(json['latitude'].toString()),
      longitude: double.parse(json['longitude'].toString()),
      altitude: double.parse(json['altitude'].toString()),
      speed: double.parse(json['speed'].toString()),
      battery: json['battery'],
      timestamp: DateTime.fromMillisecondsSinceEpoch(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'droneId': droneId,
      'deliveryId': deliveryId,
      'latitude': latitude,
      'longitude': longitude,
      'altitude': altitude,
      'speed': speed,
      'battery': battery,
      'created_at': timestamp.millisecondsSinceEpoch,
    };
  }

  String get altitudeText => '${altitude.toStringAsFixed(0)}m';
  
  String get speedText => '${speed.toStringAsFixed(1)}km/h';
  
  String get batteryText => '$battery%';

  bool get isLowBattery => battery < 30;
  
  bool get isCriticalBattery => battery < 15;

  String get batteryStatus {
    if (battery >= 80) return '충전 완료';
    if (battery >= 50) return '양호';
    if (battery >= 30) return '보통';
    if (battery >= 15) return '낮음';
    return '위험';
  }
}
