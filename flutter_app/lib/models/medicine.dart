class Medicine {
  final String name;
  final int quantity;
  final double price;
  final String? description;

  Medicine({
    required this.name,
    required this.quantity,
    required this.price,
    this.description,
  });

  factory Medicine.fromJson(Map<String, dynamic> json) {
    return Medicine(
      name: json['name'],
      quantity: json['quantity'],
      price: json['price'].toDouble(),
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'quantity': quantity,
      'price': price,
      if (description != null) 'description': description,
    };
  }

  double get total => quantity * price;
}
