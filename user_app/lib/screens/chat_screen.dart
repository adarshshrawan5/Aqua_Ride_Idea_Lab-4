import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class ChatScreen extends StatefulWidget {
  final int bookingId;
  const ChatScreen({super.key, required this.bookingId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  static const _wsBase = 'ws://10.0.2.2:8000/ws';
  WebSocketChannel? _channel;
  final _messages = <Map<String, dynamic>>[];
  final _controller = TextEditingController();
  String? _userId;

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token') ?? '';
    // Extract user ID from JWT payload
    try {
      final parts = token.split('.');
      if (parts.length == 3) {
        final payload = jsonDecode(utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))));
        _userId = payload['sub'];
      }
    } catch (_) {
      // Token is malformed; _userId remains null and messages will appear on the left side
    }
    _channel = WebSocketChannel.connect(Uri.parse('$_wsBase/chat/${widget.bookingId}?token=$token'));
    _channel!.stream.listen((msg) {
      setState(() => _messages.add(jsonDecode(msg)));
    });  }

  void _send() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _channel?.sink.add(jsonEncode({'sender_id': _userId, 'message': text}));
    _controller.clear();
  }

  @override
  void dispose() {
    _channel?.sink.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat – Booking #${widget.bookingId}')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (ctx, i) {
                final m = _messages[i];
                final isMe = m['sender_id'].toString() == _userId;
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: isMe ? const Color(0xFF00BDFB) : Colors.grey[200],
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(m['message'] ?? '', style: TextStyle(color: isMe ? Colors.white : Colors.black87)),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(child: TextField(controller: _controller, decoration: const InputDecoration(hintText: 'Type a message…'))),
                IconButton(icon: const Icon(Icons.send, color: Color(0xFF00BDFB)), onPressed: _send),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
