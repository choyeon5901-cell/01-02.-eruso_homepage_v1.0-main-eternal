import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../providers/pharmacy_provider.dart';
import '../../providers/delivery_provider.dart';
import '../../models/pharmacy.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  GoogleMapController? _mapController;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final pharmacyProvider = Provider.of<PharmacyProvider>(context, listen: false);
    final deliveryProvider = Provider.of<DeliveryProvider>(context, listen: false);
    
    await pharmacyProvider.searchNearbyPharmacies();
    await deliveryProvider.loadDeliveries();
    await deliveryProvider.loadUserStats();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('이루소 AI DDS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // TODO: 알림 화면으로 이동
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          _buildMainTab(),
          _buildOrdersTab(),
          _buildProfileTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        selectedItemColor: const Color(0xFF00C8FF),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: '홈',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt_outlined),
            activeIcon: Icon(Icons.list_alt),
            label: '주문내역',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: '마이페이지',
          ),
        ],
      ),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.pushNamed(context, '/order');
              },
              backgroundColor: const Color(0xFF00C8FF),
              icon: const Icon(Icons.add),
              label: const Text('약 주문하기'),
            )
          : null,
    );
  }

  Widget _buildMainTab() {
    return Consumer2<PharmacyProvider, DeliveryProvider>(
      builder: (context, pharmacyProvider, deliveryProvider, child) {
        return RefreshIndicator(
          onRefresh: _loadData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 활성 배송 카드
                if (deliveryProvider.activeDeliveries.isNotEmpty)
                  _buildActiveDeliveryCard(deliveryProvider),
                
                // 통계 카드
                _buildStatsCard(deliveryProvider),
                
                // 주변 약국 섹션
                _buildNearbyPharmaciesSection(pharmacyProvider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildActiveDeliveryCard(DeliveryProvider provider) {
    final delivery = provider.activeDeliveries.first;
    
    return Container(
      margin: const EdgeInsets.all(16),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: InkWell(
          onTap: () {
            Navigator.pushNamed(context, '/tracking', arguments: delivery.id);
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00C8FF).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        delivery.statusText,
                        style: const TextStyle(
                          color: Color(0xFF00C8FF),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.arrow_forward_ios, size: 16),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.local_pharmacy, color: Color(0xFF00C8FF), size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '배송지',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            delivery.deliveryAddress,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: delivery.progress,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: const AlwaysStoppedProgressIndicator(
                    value: Color(0xFF00C8FF),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '예상 도착: 약 ${delivery.remainingTime}분',
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsCard(DeliveryProvider provider) {
    final stats = provider.userStats ?? {};
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem(
                '총 주문',
                '${stats['totalOrders'] ?? 0}건',
                Icons.shopping_bag_outlined,
              ),
              _buildStatItem(
                '이번 달',
                '${stats['monthlyOrders'] ?? 0}건',
                Icons.calendar_today_outlined,
              ),
              _buildStatItem(
                '포인트',
                '${stats['points'] ?? 0}P',
                Icons.star_outline,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFF00C8FF), size: 28),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildNearbyPharmaciesSection(PharmacyProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '주변 약국',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              TextButton(
                onPressed: () {
                  provider.toggleShowOpenOnly();
                },
                child: Row(
                  children: [
                    Text(provider.showOpenOnly ? '전체' : '영업중만'),
                    const SizedBox(width: 4),
                    Icon(
                      provider.showOpenOnly
                          ? Icons.filter_list_off
                          : Icons.filter_list,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (provider.isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: CircularProgressIndicator(),
            ),
          )
        else if (provider.filteredPharmacies.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.local_pharmacy_outlined,
                      size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text(
                    '주변에 약국이 없습니다',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: provider.filteredPharmacies.length,
            itemBuilder: (context, index) {
              final pharmacy = provider.filteredPharmacies[index];
              return _buildPharmacyCard(pharmacy);
            },
          ),
      ],
    );
  }

  Widget _buildPharmacyCard(Pharmacy pharmacy) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: pharmacy.isCurrentlyOpen()
                ? const Color(0xFF00C8FF).withOpacity(0.1)
                : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.local_pharmacy,
            color: pharmacy.isCurrentlyOpen()
                ? const Color(0xFF00C8FF)
                : Colors.grey,
          ),
        ),
        title: Text(
          pharmacy.name,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              pharmacy.address,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: pharmacy.isCurrentlyOpen()
                        ? Colors.green.withOpacity(0.1)
                        : Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    pharmacy.statusText,
                    style: TextStyle(
                      color: pharmacy.isCurrentlyOpen() ? Colors.green : Colors.red,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (pharmacy.distance != null)
                  Text(
                    pharmacy.distanceText,
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          Provider.of<PharmacyProvider>(context, listen: false)
              .selectPharmacy(pharmacy);
          Navigator.pushNamed(context, '/order');
        },
      ),
    );
  }

  Widget _buildOrdersTab() {
    return Consumer<DeliveryProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.deliveries.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inbox_outlined, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                Text(
                  '주문 내역이 없습니다',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _selectedIndex = 0;
                    });
                  },
                  child: const Text('약 주문하기'),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.loadDeliveries(),
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.deliveries.length,
            itemBuilder: (context, index) {
              final delivery = provider.deliveries[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: delivery.isActive
                          ? const Color(0xFF00C8FF).withOpacity(0.1)
                          : Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      delivery.isActive ? Icons.local_shipping : Icons.check_circle,
                      color: delivery.isActive ? const Color(0xFF00C8FF) : Colors.grey,
                    ),
                  ),
                  title: Text(
                    delivery.statusText,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(delivery.deliveryAddress, maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text(
                        '${delivery.medicineList.length}개 품목 · ${delivery.totalPrice.toStringAsFixed(0)}원',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                      ),
                    ],
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.pushNamed(context, '/tracking', arguments: delivery.id);
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildProfileTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ListTile(
          leading: const CircleAvatar(
            radius: 30,
            backgroundColor: Color(0xFF00C8FF),
            child: Icon(Icons.person, color: Colors.white, size: 32),
          ),
          title: const Text(
            '홍길동',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          subtitle: const Text('hong@example.com'),
          trailing: TextButton(
            onPressed: () {
              Navigator.pushNamed(context, '/profile');
            },
            child: const Text('프로필 수정'),
          ),
        ),
        const Divider(height: 32),
        _buildProfileMenuItem(
          Icons.history,
          '주문 내역',
          () {
            Navigator.pushNamed(context, '/history');
          },
        ),
        _buildProfileMenuItem(
          Icons.location_on_outlined,
          '배송지 관리',
          () {},
        ),
        _buildProfileMenuItem(
          Icons.payment_outlined,
          '결제 수단',
          () {},
        ),
        _buildProfileMenuItem(
          Icons.notifications_outlined,
          '알림 설정',
          () {},
        ),
        _buildProfileMenuItem(
          Icons.help_outline,
          '고객센터',
          () {},
        ),
        _buildProfileMenuItem(
          Icons.settings_outlined,
          '설정',
          () {},
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: () {
            // 로그아웃 로직
            Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
          },
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: const Text('로그아웃'),
        ),
      ],
    );
  }

  Widget _buildProfileMenuItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey.shade700),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }
}
