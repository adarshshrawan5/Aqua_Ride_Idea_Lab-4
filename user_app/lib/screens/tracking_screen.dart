import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';

class TrackingScreen extends StatefulWidget {
  final int bookingId;
  const TrackingScreen({super.key, required this.bookingId});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  static const _wsBase = 'ws://10.0.2.2:8000/ws';
  WebSocketChannel? _channel;
  Map<String, dynamic>? _location;

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    _channel = WebSocketChannel.connect(Uri.parse('$_wsBase/tracking/${widget.bookingId}?token=$token'));
    _channel!.stream.listen((msg) {
      setState(() => _location = jsonDecode(msg));
    });
  }

  @override
  void dispose() {
    _channel?.sink.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Tracking – Booking #${widget.bookingId}')),
      body: Center(
        child: _location == null
            ? const Text('Waiting for driver location…')
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.location_on, size: 64, color: Color(0xFF00BDFB)),
                  const SizedBox(height: 16),
                  Text('Lat: ${(_location!['lat'] as num).toStringAsFixed(5)}', style: const TextStyle(fontSize: 20)),
                  Text('Lon: ${(_location!['lon'] as num).toStringAsFixed(5)}', style: const TextStyle(fontSize: 20)),
                ],
              ),
      ),
    );
  }
}
