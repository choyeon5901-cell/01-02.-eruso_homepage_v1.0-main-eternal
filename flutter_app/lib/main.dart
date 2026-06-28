import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/order/order_screen.dart';
import 'screens/tracking/tracking_screen.dart';
import 'screens/history/history_screen.dart';
import 'screens/profile/profile_screen.dart';

import 'providers/auth_provider.dart';
import 'providers/delivery_provider.dart';
import 'providers/pharmacy_provider.dart';

import 'services/fcm_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase 초기화
  await Firebase.initializeApp();
  
  // FCM 초기화
  await FCMService().initialize();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DeliveryProvider()),
        ChangeNotifierProvider(create: (_) => PharmacyProvider()),
      ],
      child: MaterialApp(
        title: '이루소 AI DDS',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primaryColor: const Color(0xFF00C8FF),
          scaffoldBackgroundColor: Colors.white,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF00C8FF),
            primary: const Color(0xFF00C8FF),
            secondary: const Color(0xFFFF6B35),
          ),
          textTheme: GoogleFonts.notoSansKrTextTheme(),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF00C8FF),
            elevation: 0,
            centerTitle: true,
            iconTheme: IconThemeData(color: Colors.white),
            titleTextStyle: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00C8FF),
              foregroundColor: Colors.white,
              elevation: 2,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.grey),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF00C8FF), width: 2),
            ),
            filled: true,
            fillColor: Colors.grey[50],
          ),
        ),
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/order': (context) => const OrderScreen(),
          '/tracking': (context) => const TrackingScreen(),
          '/history': (context) => const HistoryScreen(),
          '/profile': (context) => const ProfileScreen(),
        },
      ),
    );
  }
}
