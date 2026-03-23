# 🌊 AquaRide

A full‑scale, industry‑grade water‑ride booking platform featuring:

- **User booking system** – create and track rides
- **Driver app** – real‑time GPS sharing
- **Admin dashboard** – monitor all bookings and drivers
- **Live chat** – user ↔ driver WebSocket messaging
- **Real‑time GPS tracking** – WebSocket‑powered map updates
- **Secure authentication** – JWT with role‑based access control (Admin, User, Driver)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python · FastAPI · Uvicorn |
| **Database** | PostgreSQL (via SQLAlchemy) |
| **Cache / Queue** | Redis · Celery |
| **Auth** | JWT (`python-jose`) · bcrypt (`passlib`) |
| **Real‑time** | WebSockets (FastAPI native) |
| **Maps** | Mapbox (JS + Flutter SDK) |
| **Web Frontend** | React 18 · Tailwind CSS · Axios |
| **Mobile Apps** | Flutter (driver + user) |
| **Deployment** | Backend → Render/Railway · Frontend → Vercel · DB → Supabase/Neon |

---

## 📁 Folder Structure

```
AquaRide/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   └── models.py      # ORM models (User, Driver, Booking, ChatMessage)
│   │   ├── routes/
│   │   │   ├── auth.py        # Register / Login / Me
│   │   │   ├── bookings.py    # Create & manage bookings
│   │   │   ├── drivers.py     # Driver registration & location
│   │   │   ├── tracking.py    # REST location snapshot
│   │   │   └── chat.py        # Persist & retrieve messages
│   │   ├── services/          # (business logic layer – extend here)
│   │   ├── websockets/
│   │   │   └── manager.py     # Chat + tracking WebSocket rooms
│   │   └── utils/
│   │       ├── auth.py        # JWT helpers & password hashing
│   │       ├── geo.py         # Haversine distance & fare estimate
│   │       └── dependencies.py# FastAPI auth dependencies & RBAC
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                  # React + Tailwind CSS web app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── BookingPage.js
│   │   │   ├── TrackingPage.js
│   │   │   ├── ChatPage.js
│   │   │   └── AdminPage.js
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── driver_app/                # Flutter – driver GPS sharing app
│   ├── lib/
│   │   └── main.dart
│   └── pubspec.yaml
│
└── user_app/                  # Flutter – user booking & tracking app
    ├── lib/
    │   └── main.dart
    └── pubspec.yaml
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Flutter 3.22+ *(for mobile apps)*

---

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, etc.

# Run the development server
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000** and the auto‑generated docs at **http://localhost:8000/docs**.

---

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The web app will be available at **http://localhost:3000**.

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

## 🔌 WebSocket Endpoints

| Endpoint | Purpose |
|----------|---------|
| `ws://localhost:8000/ws/chat/{booking_id}` | Real‑time user ↔ driver chat |
| `ws://localhost:8000/ws/tracking/{booking_id}` | Live GPS tracking |

---

## 🔐 Authentication

All protected endpoints require a Bearer token obtained from `POST /api/auth/login`.

Roles:

| Role | Permissions |
|------|------------|
| `admin` | View all bookings, all endpoints |
| `user` | Create bookings, chat, track own rides |
| `driver` | Update location, accept/complete bookings |

---

## 📦 Deployment

| Service | Platform |
|---------|---------|
| Backend API | Render · Railway · AWS EC2 |
| Frontend | Vercel · Netlify |
| Database | Supabase · Neon · Railway |
| Redis | Upstash · Railway |
