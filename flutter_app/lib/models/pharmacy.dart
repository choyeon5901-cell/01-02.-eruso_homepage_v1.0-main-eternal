class Pharmacy {
  final String id;
  final String name;
  final String address;
  final String phone;
  final double latitude;
  final double longitude;
  final String operatingHours;
  final bool isOpen;
  final double? distance;
  final double? rating;
  final int? reviewCount;

  Pharmacy({
    required this.id,
    required this.name,
    required this.address,
    required this.phone,
    required this.latitude,
    required this.longitude,
    required this.operatingHours,
    required this.isOpen,
    this.distance,
    this.rating,
    this.reviewCount,
  });

  factory Pharmacy.fromJson(Map<String, dynamic> json) {
    return Pharmacy(
      id: json['id'],
      name: json['name'],
      address: json['address'],
      phone: json['phone'],
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      operatingHours: json['operatingHours'],
      isOpen: json['isOpen'],
      distance: json['distance']?.toDouble(),
      rating: json['rating']?.toDouble(),
      reviewCount: json['reviewCount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'phone': phone,
      'latitude': latitude,
      'longitude': longitude,
      'operatingHours': operatingHours,
      'isOpen': isOpen,
    };
  }
}
