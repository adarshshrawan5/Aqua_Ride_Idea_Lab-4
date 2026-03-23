import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';

const String kApiBase = 'http://localhost:8000';
const String kWsBase = 'ws://localhost:8000';

void main() {
  runApp(const AquaRideUserApp());
}

class AquaRideUserApp extends StatelessWidget {
  const AquaRideUserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaRide',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF00BFFF),
        useMaterial3: true,
      ),
      home: const BookingScreen(),
    );
  }
}

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _pickupLatCtrl = TextEditingController();
  final _pickupLngCtrl = TextEditingController();
  final _dropoffLatCtrl = TextEditingController();
  final _dropoffLngCtrl = TextEditingController();

  bool _loading = false;
  Map<String, dynamic>? _booking;
  String? _error;

  // NOTE: In production, retrieve token from secure storage after login.
  String get _token => '';

  Future<void> _createBooking() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await http.post(
        Uri.parse('$kApiBase/api/bookings/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({
          'pickup_lat': double.parse(_pickupLatCtrl.text),
          'pickup_lng': double.parse(_pickupLngCtrl.text),
          'dropoff_lat': double.parse(_dropoffLatCtrl.text),
          'dropoff_lng': double.parse(_dropoffLngCtrl.text),
        }),
      );
      if (response.statusCode == 201) {
        setState(() => _booking = jsonDecode(response.body));
      } else {
        setState(() => _error = 'Booking failed: ${response.body}');
      }
    } catch (e) {
      setState(() => _error = 'Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_booking != null) {
      return _BookingConfirmed(booking: _booking!);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('🌊 AquaRide'), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Book a Ride',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: const TextStyle(color: Colors.red)),
              ),
            const SizedBox(height: 12),
            _buildField(_pickupLatCtrl, 'Pickup Latitude'),
            _buildField(_pickupLngCtrl, 'Pickup Longitude'),
            _buildField(_dropoffLatCtrl, 'Drop-off Latitude'),
            _buildField(_dropoffLngCtrl, 'Drop-off Longitude'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _createBooking,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: const Color(0xFF00BFFF),
                foregroundColor: Colors.white,
              ),
              child: _loading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Confirm Booking', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController ctrl, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: ctrl,
        keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
    );
  }
}

class _BookingConfirmed extends StatefulWidget {
  final Map<String, dynamic> booking;
  const _BookingConfirmed({required this.booking});

  @override
  State<_BookingConfirmed> createState() => _BookingConfirmedState();
}

class _BookingConfirmedState extends State<_BookingConfirmed> {
  WebSocketChannel? _channel;
  Map<String, dynamic>? _driverLocation;

  @override
  void initState() {
    super.initState();
    _connectTracking();
  }

  void _connectTracking() {
    final bookingId = widget.booking['id'];
    _channel = WebSocketChannel.connect(
      Uri.parse('$kWsBase/ws/tracking/$bookingId'),
    );
    _channel!.stream.listen((message) {
      try {
        setState(() => _driverLocation = jsonDecode(message));
      } catch (_) {}
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
      appBar: AppBar(title: const Text('🌊 AquaRide'), centerTitle: true),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 64),
            const SizedBox(height: 12),
            const Text(
              'Booking Confirmed!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Booking ID: ${widget.booking['id']}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
            Text(
              'Estimated Fare: ₹${widget.booking['fare']}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),
            const Text(
              'Driver Location',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (_driverLocation != null) ...[
              Text('Latitude: ${_driverLocation!['latitude']}'),
              Text('Longitude: ${_driverLocation!['longitude']}'),
            ] else
              const Text('Waiting for driver…', style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
