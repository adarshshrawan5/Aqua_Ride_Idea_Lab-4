import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'tracking_screen.dart';
import 'chat_screen.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  static const _apiBase = 'http://10.0.2.2:8000';

  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  List<dynamic> _bookings = [];
  bool _loading = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _fetchBookings();
  }

  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') ?? '';
  }

  Future<void> _fetchBookings() async {
    final token = await _getToken();
    final res = await http.get(Uri.parse('$_apiBase/api/bookings/'), headers: {'Authorization': 'Bearer $token'});
    if (res.statusCode == 200) {
      setState(() => _bookings = jsonDecode(res.body));
    }
  }

  Future<void> _createBooking() async {
    setState(() { _loading = true; _message = null; });
    final token = await _getToken();
    // TODO: Replace hardcoded coordinates with real geocoding (e.g. Google Maps Geocoding API
    // or Nominatim) to convert pickup/dropoff addresses to lat/lon before production deployment.
    final res = await http.post(
      Uri.parse('$_apiBase/api/bookings/'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: jsonEncode({
        'pickup_address': _pickupController.text,
        'pickup_lat': 12.9716,
        'pickup_lon': 77.5946,
        'dropoff_address': _dropoffController.text,
        'dropoff_lat': 13.0827,
        'dropoff_lon': 80.2707,
      }),
    );
    setState(() => _loading = false);
    if (res.statusCode == 201) {
      setState(() => _message = 'Booking created!');
      await _fetchBookings();
    } else {
      setState(() => _message = jsonDecode(res.body)['detail'] ?? 'Failed');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🌊 Book a Ride')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _pickupController, decoration: const InputDecoration(labelText: 'Pickup address')),
            TextField(controller: _dropoffController, decoration: const InputDecoration(labelText: 'Dropoff address')),
            const SizedBox(height: 16),
            if (_message != null) Text(_message!, style: TextStyle(color: _message == 'Booking created!' ? Colors.green : Colors.red)),
            _loading
                ? const CircularProgressIndicator()
                : ElevatedButton(onPressed: _createBooking, child: const Text('Request Ride')),
            const Divider(height: 32),
            const Align(alignment: Alignment.centerLeft, child: Text('My Bookings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
            Expanded(
              child: ListView.builder(
                itemCount: _bookings.length,
                itemBuilder: (ctx, i) {
                  final b = _bookings[i];
                  return ListTile(
                    title: Text('${b['pickup_address']} → ${b['dropoff_address']}'),
                    subtitle: Text('Status: ${b['status']}  |  Fare: \$${b['fare_estimate'] ?? '—'}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(icon: const Icon(Icons.gps_fixed), onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => TrackingScreen(bookingId: b['id'])));
                        }),
                        IconButton(icon: const Icon(Icons.chat), onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(bookingId: b['id'])));
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
