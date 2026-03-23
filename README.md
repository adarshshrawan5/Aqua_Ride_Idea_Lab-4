# 🌊 AquaRide

**AquaRide** is a full-scale ride-booking platform with:

- 🗺️ Real-time GPS tracking (WebSockets)
- 💬 Live user ↔ driver chat (WebSockets)
- 📋 Admin dashboard
- 🚗 Driver mobile app (Flutter)
- 📱 User mobile app (Flutter)
- 🌐 User web app (React + Tailwind CSS)
- 🔐 Secure JWT authentication with role-based access (Admin / User / Driver)

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python) |
| Real-time | WebSockets (FastAPI) |
| Database | PostgreSQL + SQLAlchemy |
| Caching / Queue | Redis + Celery |
| Authentication | JWT (`python-jose`) |
| Password hashing | bcrypt (`passlib`) |
| Geo distance | `geopy` |
| Web frontend | React 18 + Tailwind CSS + React Router |
| Maps | Mapbox GL JS |
| Mobile apps | Flutter 3 |
| Deployment | Render / Railway / Vercel / Supabase |

---

## 🗂️ Project Structure

```
AquaRide/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models/            # ORM models (User, Driver, Booking, ChatMessage)
│   │   ├── routes/            # REST endpoints (auth, bookings, tracking, chat, admin, drivers)
│   │   ├── services/          # Business logic
│   │   ├── websockets/        # Real-time tracking & chat WebSocket handlers
│   │   └── utils/             # JWT, security, geo helpers, config
│   ├── alembic.ini
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Router & private routes
│   │   ├── pages/             # LoginPage, RegisterPage, BookingPage, TrackingPage, ChatPage, AdminDashboard
│   │   ├── components/        # Navbar
│   │   ├── hooks/             # useAuth, useWebSocket
│   │   └── services/          # Axios API client
│   ├── public/index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
├── driver_app/                # Flutter – driver GPS tracking app
│   ├── lib/
│   │   ├── main.dart
│   │   └── screens/           # LoginScreen, HomeScreen (live GPS push via WebSocket)
│   └── pubspec.yaml
│
├── user_app/                  # Flutter – user booking & tracking app
│   ├── lib/
│   │   ├── main.dart
│   │   └── screens/           # LoginScreen, BookingScreen, TrackingScreen, ChatScreen
│   └── pubspec.yaml
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Flutter 3.x
- PostgreSQL
- Redis

---

### 1. Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secret key

# Start the API server
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend (Web)

```bash
cd frontend
cp .env.example .env
# Set REACT_APP_MAPBOX_TOKEN in .env

npm install
npm start
```

Open: http://localhost:3000

---

### 3. Driver App (Flutter)

```bash
cd driver_app
flutter pub get
flutter run
```

---

### 4. User App (Flutter)

```bash
cd user_app
flutter pub get
flutter run
```

---

## 🔐 Authentication

All protected endpoints require a Bearer JWT token.

### Roles
| Role | Permissions |
|---|---|
| `user` | Book rides, view own bookings, chat, track |
| `driver` | Accept bookings, update location, chat |
| `admin` | View all users & bookings, deactivate users |

---

## 🌐 Key API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user/driver |
| `POST` | `/api/auth/login` | Login, get JWT |
| `POST` | `/api/bookings/` | Create a booking |
| `GET` | `/api/bookings/` | List user's bookings |
| `PATCH` | `/api/bookings/{id}/status` | Update booking status (driver/admin) |
| `PUT` | `/api/tracking/driver/{id}` | Update driver location (REST fallback) |
| `GET` | `/api/tracking/driver/{id}` | Get driver location |
| `GET` | `/api/chat/{booking_id}/messages` | Get chat history |
| `GET` | `/api/admin/users` | List all users (admin) |
| `GET` | `/api/admin/bookings` | List all bookings (admin) |
| `WS` | `/ws/tracking/{booking_id}` | Real-time location stream |
| `WS` | `/ws/chat/{booking_id}` | Real-time chat |

---

## 💬 WebSocket Protocols

### Tracking (`/ws/tracking/{booking_id}`)
Driver sends:
```json
{"lat": 12.9716, "lon": 77.5946}
```
All subscribers (user + admin) receive:
```json
{"booking_id": 1, "lat": 12.9716, "lon": 77.5946}
```

### Chat (`/ws/chat/{booking_id}`)
Any participant sends:
```json
{"sender_id": 42, "message": "I am 5 minutes away"}
```
All participants receive the same payload with `booking_id` appended.

---

## 📦 Deployment

| Service | Recommended Platform |
|---|---|
| Backend | Render / Railway / AWS EC2 |
| Frontend | Vercel / Netlify |
| Database | Supabase / Neon / Railway |
| Redis | Upstash / Railway |
