class User {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String address;
  final double? latitude;
  final double? longitude;
  final String? fcmToken;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.address,
    this.latitude,
    this.longitude,
    this.fcmToken,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      email: json['email'],
      address: json['address'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
      fcmToken: json['fcmToken'],
      createdAt: DateTime.fromMillisecondsSinceEpoch(json['created_at']),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'fcmToken': fcmToken,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? phone,
    String? email,
    String? address,
    double? latitude,
    double? longitude,
    String? fcmToken,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      fcmToken: fcmToken ?? this.fcmToken,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
