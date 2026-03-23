import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

const String kApiBase = 'http://localhost:8000';
const String kWsBase = 'ws://localhost:8000';

void main() {
  runApp(const AquaRideDriverApp());
}

class AquaRideDriverApp extends StatelessWidget {
  const AquaRideDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaRide Driver',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF00BFFF),
        useMaterial3: true,
      ),
      home: const TrackingScreen(),
    );
  }
}

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({super.key});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  // Replace with the actual booking ID after login flow is added
  final int bookingId = 1;

  WebSocketChannel? _channel;
  StreamSubscription<Position>? _positionSubscription;
  Position? _lastPosition;
  bool _streaming = false;

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _channel?.sink.close();
    super.dispose();
  }

  Future<void> _startTracking() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    _channel = WebSocketChannel.connect(
      Uri.parse('$kWsBase/ws/tracking/$bookingId'),
    );

    setState(() => _streaming = true);

    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((Position position) {
      setState(() => _lastPosition = position);
      _channel?.sink.add(jsonEncode({
        'latitude': position.latitude,
        'longitude': position.longitude,
      }));
    });
  }

  void _stopTracking() {
    _positionSubscription?.cancel();
    _channel?.sink.close();
    setState(() {
      _streaming = false;
      _positionSubscription = null;
      _channel = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🌊 AquaRide Driver'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'GPS Tracking',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_lastPosition != null) ...[
              _infoTile('Latitude', _lastPosition!.latitude.toStringAsFixed(6)),
              _infoTile('Longitude', _lastPosition!.longitude.toStringAsFixed(6)),
              _infoTile('Accuracy', '${_lastPosition!.accuracy.toStringAsFixed(1)} m'),
            ] else
              const Text('Location not available yet.', style: TextStyle(color: Colors.grey)),
            const Spacer(),
            ElevatedButton.icon(
              onPressed: _streaming ? _stopTracking : _startTracking,
              icon: Icon(_streaming ? Icons.stop : Icons.play_arrow),
              label: Text(_streaming ? 'Stop Sharing Location' : 'Start Sharing Location'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: _streaming ? Colors.red : const Color(0xFF00BFFF),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
