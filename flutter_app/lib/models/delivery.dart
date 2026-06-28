import 'medicine.dart';

class Delivery {
  final String id;
  final String userId;
  final String pharmacyId;
  final String status;
  final String pickupAddress;
  final String deliveryAddress;
  final double latitude;
  final double longitude;
  final String? droneId;
  final int estimatedTime;
  final int? actualTime;
  final List<Medicine> medicineList;
  final double totalPrice;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? pharmacyName;
  final DateTime? deliveredAt;
  final int? progress;

  Delivery({
    required this.id,
    required this.userId,
    required this.pharmacyId,
    required this.status,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.latitude,
    required this.longitude,
    this.droneId,
    required this.estimatedTime,
    this.actualTime,
    required this.medicineList,
    required this.totalPrice,
    required this.createdAt,
    required this.updatedAt,
    this.pharmacyName,
    this.deliveredAt,
    this.progress,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'],
      userId: json['userId'],
      pharmacyId: json['pharmacyId'],
      status: json['status'],
      pickupAddress: json['pickupAddress'],
      deliveryAddress: json['deliveryAddress'],
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      droneId: json['droneId'],
      estimatedTime: json['estimatedTime'],
      actualTime: json['actualTime'],
      medicineList: (json['medicineList'] as List)
          .map((m) => Medicine.fromJson(m))
          .toList(),
      totalPrice: json['totalPrice'].toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      pharmacyName: json['pharmacyName'],
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.parse(json['deliveredAt'])
          : null,
      progress: json['progress'],
    );
  }

  String get statusText {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '준비 중';
      case 'in_transit':
        return '배송 중';
      case 'delivered':
        return '배송 완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  }

  bool get canCancel => status == 'pending' || status == 'processing';
}
