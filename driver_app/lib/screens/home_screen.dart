import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const _wsBase = 'ws://10.0.2.2:8000/ws';

  WebSocketChannel? _channel;
  StreamSubscription<Position>? _locationSub;
  String _status = 'Idle';
  int? _activeBookingId;

  @override
  void dispose() {
    _locationSub?.cancel();
    _channel?.sink.close();
    super.dispose();
  }

  Future<void> _startTracking(int bookingId) async {    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      setState(() => _status = 'Location permission denied');
      return;
    }
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    _channel = WebSocketChannel.connect(Uri.parse('$_wsBase/tracking/$bookingId?token=$token'));
    _activeBookingId = bookingId;

    _locationSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10),
    ).listen((pos) {
      _channel?.sink.add(jsonEncode({'lat': pos.latitude, 'lon': pos.longitude}));
      setState(() => _status = 'Tracking: ${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}');
    });

    setState(() => _status = 'Tracking started for booking #$bookingId');
  }

  void _stopTracking() {
    _locationSub?.cancel();
    _channel?.sink.close();
    setState(() { _status = 'Tracking stopped'; _activeBookingId = null; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🌊 AquaRide Driver')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Status: $_status', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 24),
            if (_activeBookingId == null)
              ElevatedButton.icon(
                onPressed: () => _startTracking(1), // TODO: replace with dynamically selected active booking ID
                icon: const Icon(Icons.gps_fixed),
                label: const Text('Start Tracking (Booking #1)'),
              )
            else
              ElevatedButton.icon(
                onPressed: _stopTracking,
                icon: const Icon(Icons.stop),
                label: const Text('Stop Tracking'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              ),
          ],
        ),
      ),
    );
  }
}
