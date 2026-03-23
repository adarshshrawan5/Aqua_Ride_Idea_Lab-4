import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() => runApp(const AquaRideUserApp());

class AquaRideUserApp extends StatelessWidget {
  const AquaRideUserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaRide',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF00BDFB),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
