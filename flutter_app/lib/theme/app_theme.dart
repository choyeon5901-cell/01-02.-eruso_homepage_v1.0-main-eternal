import 'package:flutter/material.dart';

class AppTheme {
  // 브랜드 컬러
  static const Color primaryColor = Color(0xFF00C8FF); // 시안 블루
  static const Color secondaryColor = Color(0xFF0066CC); // 다크 블루
  static const Color accentColor = Color(0xFFFFB800); // 골든 옐로우
  
  // 상태 컬러
  static const Color successColor = Color(0xFF00C853);
  static const Color warningColor = Color(0xFFFFB800);
  static const Color errorColor = Color(0xFFFF3D00);
  static const Color infoColor = Color(0xFF00B0FF);
  
  // 텍스트 컬러
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textTertiary = Color(0xFF999999);
  
  // 배경 컬러
  static const Color backgroundLight = Color(0xFFFAFAFA);
  static const Color backgroundWhite = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF1A1A1A);
  
  // Light Theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    primaryColor: primaryColor,
    scaffoldBackgroundColor: backgroundLight,
    
    // AppBar 테마
    appBarTheme: const AppBarTheme(
      backgroundColor: backgroundWhite,
      foregroundColor: textPrimary,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w700,
        fontFamily: 'Pretendard',
      ),
    ),
    
    // 컬러 스킴
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      primary: primaryColor,
      secondary: secondaryColor,
      error: errorColor,
      background: backgroundLight,
      surface: backgroundWhite,
    ),
    
    // 텍스트 테마
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      displayMedium: TextStyle(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      displaySmall: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      headlineMedium: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      titleLarge: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      titleMedium: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: textPrimary,
        fontFamily: 'Pretendard',
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: textSecondary,
        fontFamily: 'Pretendard',
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: textTertiary,
        fontFamily: 'Pretendard',
      ),
    ),
    
    // 버튼 테마
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          fontFamily: 'Pretendard',
        ),
      ),
    ),
    
    // 카드 테마
    cardTheme: CardTheme(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      color: backgroundWhite,
      margin: const EdgeInsets.all(8),
    ),
    
    // Input 테마
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: backgroundWhite,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: errorColor),
      ),
    ),
  );
}
