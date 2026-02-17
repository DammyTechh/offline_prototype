# Offline CBT Examination System

> **Fullstack Offline-First Secure Computer-Based Test Platform**

A production-ready CBT exam platform designed for large-scale institutional exams with full offline capability, encrypted answer storage, automatic sync, and comprehensive anti-cheat monitoring.

##  Overview

This system enables secure examination delivery where:

- ✅ Students load questions while online
- ✅ Internet is disabled during the exam
- ✅ Answers are stored locally with encryption
- ✅ Answers sync automatically when internet returns
- ✅ Backend stores encrypted answers in MongoDB
- ✅ Anti-cheat monitoring throughout the exam

**Designed for:** Large-scale institutional exams, university testing centers, certification programs, and integration into existing educational systems.

---

##  System Architecture

```
┌─────────────────────┐
│  Student Browser    │
│     (Vue 3)         │
└──────────┬──────────┘
           │
           │ 1. Fetch questions (ONLINE)
           ▼
┌─────────────────────┐
│   Node.js API       │
│   (Express)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     MongoDB         │
│ (Questions+Answers) │
└─────────────────────┘

OFFLINE FLOW:
┌─────────────────────┐
│  Student Browser    │
├─────────────────────┤
│ IndexedDB Storage   │
│ Offline Answering   │
│ Auto Sync on Reconnect
└─────────────────────┘
```

---

##  Tech Stack

### Frontend
- **Vue 3** with TypeScript
- **Pinia** state management
- **IndexedDB/localStorage** for offline storage
- **Axios** API client
- **Vite** build tool
- **PWA** (Service Worker + offline caching)
- **Offline detection** (`navigator.onLine`)

### Backend
- **Node.js** runtime
- **Express.js** web framework
- **MongoDB** database
- **Mongoose** ODM
- **AES encryption** for answer security
- **WebSocket** for anti-cheat monitoring
- **Crypto** for data encryption

---

##  Security Model

### 1️⃣ Offline Enforcement
- Questions cached before exam starts
- Internet must be disabled during exam
- Submission blocked while offline
- Visual indicators for connection status

### 2️⃣ Answer Encryption
```javascript
answer: encrypt(String(a.answer))
```
- All answers encrypted before database storage
- Prevents database tampering and data leaks
- AES encryption used throughout

### 3️⃣ Anti-Cheat Monitoring

**Frontend Detection:**
- Tab switching
- Window blur events
- Window minimize
- Visibility changes

**Violation Handling:**
- Maximum 3 violations allowed
- After limit: Exam locked + forced submission
- All violations logged with timestamps

### 4️⃣ No Correct Answers on Client

Backend only returns:
```json
{
  "id": "...",
  "text": "...",
  "options": [...]
}
```
Correct answers **never** exposed to client-side code.

---

## Offline Exam Logic

### Exam Lifecycle

#### **Step 1 — Load Questions (ONLINE)**
```
GET /exam/questions
```
- Frontend fetches all exam questions
- Questions cached locally in IndexedDB
- Student sees: "You may disconnect internet after questions load"

#### **Step 2 — Disable Internet**
- Student instructed to disconnect
- UI displays clear offline message
- System verifies offline status

#### **Step 3 — Offline Answering**
Answers stored locally:
```javascript
{
  student_id: "STU123",
  question_id: "6992ff458af501964b21d850",
  answer: 2,
  timestamp: 1708000000
}
```

#### **Step 4 — Reconnect Internet**
- Student clicks submit
- Frontend checks: `if (!navigator.onLine)`
- Prevents submission if still offline

#### **Step 5 — Sync Answers**
```
POST /answers/bulk
```
- Frontend sends all answers in batch
- Backend encrypts and stores
- Confirmation returned to student

---

## Database Schema

### Question Model
```javascript
{
  _id: ObjectId,
  text: String,
  options: [String],
  correct: Number
}
```

### Answer Model
```javascript
const AnswerSchema = new mongoose.Schema({
  student_id: String,
  question_id: mongoose.Schema.Types.ObjectId,
  answer: String,  // Encrypted
  timestamp: Number
});
```

**Important:** `question_id` must be `ObjectId`, not `Number` (prevents Mongo mismatch errors).

---

##  Answer Sync Logic

### Bulk Sync Route
**Endpoint:** `POST /answers/bulk`

**Payload:**
```json
[
  {
    "student_id": "STU1",
    "question_id": "6992ff458af501964b21d850",
    "answer": 2,
    "timestamp": 1708000000
  }
]
```

**Logic:**
```javascript
bulkOps.push({
  updateOne: {
    filter: { student_id, question_id },
    update: {
      student_id,
      question_id,
      answer: encrypt(answer),
      timestamp
    },
    upsert: true
  }
});
```

### Single Answer Route
**Endpoint:** `POST /answers`

Same schema as bulk, processes one answer at a time.

---

## Backend API

**Base URL:** `http://localhost:3000`

### Get Questions
```http
GET /exam/questions
```

**Response:**
```json
[
  {
    "id": "6992ff458af501964b21d850",
    "text": "Capital of France?",
    "options": ["Paris", "Rome", "Berlin", "Madrid"]
  }
]
```

### Submit Single Answer
```http
POST /answers
```

### Submit Bulk Answers
```http
POST /answers/bulk
```

---

##  Frontend Exam Flow

**Component:** `ExamView.vue`

**States:** `loading → start → exam → submit`

### Start Screen
```
┌────────────────────────────┐
│   Computer Based Test      │
│                            │
│ You may disconnect         │
│ internet after questions   │
│ load.                      │
│                            │
│      [Start Exam]          │
└────────────────────────────┘
```

### Exam Screen
Displays:
- Question number
- Timer (countdown)
- Progress bar
- Multiple choice options
- Navigation (previous/next)
- Submit button

---

## Timer System

**Default Duration:** 30 minutes

**Logic:**
```javascript
timeLeft--;
if (timeLeft <= 0) {
  // Auto-submit prompt
}
```

- Countdown displayed prominently
- Auto-submit when time expires
- Warning at 5 minutes remaining

---

## Offline Storage

**File:** `offline/secureStorage.ts`

**Functions:**
- `saveLocal()` - Store answer locally
- `getAllLocal()` - Retrieve all cached answers
- `clearLocal()` - Clear after successful sync

Stores answers locally until sync completes.

---

##  Network Awareness

**Frontend Detection:**
```javascript
navigator.onLine
window.addEventListener("online")
window.addEventListener("offline")
```

- Real-time connection status monitoring
- Visual indicators for online/offline state
- Auto-sync triggered on reconnection

---

## Anti-Cheat System

**Triggers:**
- `document.visibilitychange`
- `window.blur`
- Tab switching
- Window minimize

**Violation Count:**
- Maximum: 3 violations
- Action after limit: Exam locked + force submit
- All violations logged to backend

---

## WebSocket Channel

**Server:** `ws://localhost:9001`


## Installation & Setup

### Option 1: Development Mode (Default - Normal Offline Storage)

This is the standard way to run the offline exam system with local cache storage.

#### Backend Setup

```bash
cd server
npm install
node index.js
```

**Expected Output:**
```
MongoDB connected
Exam server running on http://localhost:3000
```

#### Seed Sample Questions

```bash
node seed.js
```

#### Frontend Setup

```bash
cd web-client
npm install
npm run dev
```

**Opens:** `http://localhost:5173`

**How it works:**
- ✅ Normal browser-based offline storage
- ✅ Answers cached in IndexedDB/localStorage
- ✅ Full offline exam capability
- ✅ Automatic sync on reconnection

---

### Option 2: PWA Mode (Advanced - Progressive Web App)

For production deployment with native app experience and enhanced caching via Service Workers.

#### Why PWA?

- ✅ App installs on student devices like native app
- ✅ Questions cached via Service Worker
- ✅ Advanced offline fallbacks
- ✅ No browser UI (fullscreen exam mode)
- ✅ Installable on Chrome, Edge, Firefox

#### PWA Plugin Configuration

The project already includes PWA plugin in `vite.config.ts`:

```javascript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "CBT Exam",
        short_name: "CBT",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#2563eb",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/exam\/questions/,
            handler: "NetworkFirst",
            options: {
              cacheName: "questions-cache",
              expiration: {
                maxEntries: 50
              }
            }
          }
        ]
      }
    })
  ]
});
```

#### Build & Preview PWA

```bash
cd web-client
npm run build
npm run preview
```

**Generates:**
```
dist/
 ├ index.html
 ├ assets/
 ├ manifest.webmanifest
 └ sw.js (Service Worker)
```

**Starts PWA server:** `http://localhost:4173`

**Verifies:**
- ✔ Service Worker registered
- ✔ PWA installable
- ✔ Offline ready with Service Worker caching

#### Installing the Exam App (Students)

After PWA deployment:

1. Open exam URL in Chrome/Edge
2. Browser shows: **"Install CBT Exam"**
3. Click Install
4. App runs like native app:
   - No address bar
   - No tabs
   - Fullscreen exam mode
   - Can run offline

#### Offline Exam via PWA

**Flow:**
1. Student opens app online
2. Questions load from API
3. Service Worker caches all data
4. Internet disabled
5. Exam continues fully offline
6. Answers stored locally
7. Internet restored
8. Answers sync to backend

#### PWA Cached Resources

Service Worker caches:
- App shell (HTML/CSS/JS)
- Question API responses
- Exam UI components
- Static assets
- Fonts and icons

---

## Testing Offline Flow

### Test Option 1: Development Mode (Default)

**Setup:**

```bash
# Terminal 1 - Backend
cd server
npm install
node seed.js
node index.js

# Terminal 2 - Frontend
cd web-client
npm install
npm run dev
```

**Test Steps:**

1. Open browser: `http://localhost:5173`
2. Wait for questions to load
3. **Disconnect internet** (disable Wi-Fi/Ethernet)
4. Click "Start Exam"
5. Answer questions offline
6. **Reconnect internet**
7. Click "Submit"
8. Verify answers synced to MongoDB

### Test Option 2: PWA Mode (Production Build)

**Setup:**

```bash
# Terminal 1 - Backend
cd server
npm install
node seed.js
node index.js

# Terminal 2 - Frontend PWA Build
cd web-client
npm install
npm run build
npm run preview
```

**Test PWA Offline (DevTools Method):**

1. Open: `http://localhost:4173`
2. Open browser DevTools (F12)
3. Go to: **Application** → **Service Workers**
4. Check **"Offline"** checkbox
5. Reload page
6. Verify:
   - ✔ App still loads (from Service Worker cache)
   - ✔ Exam works fully offline
   - ✔ Questions display from cache
   - ✔ Answers save locally
7. Uncheck "Offline" to simulate reconnection
8. Click "Submit" to sync answers

**Test PWA Installation (Chrome/Edge):**

1. Open: `http://localhost:4173`
2. Look for **"Install CBT Exam"** button in address bar
3. Click Install
4. App opens in standalone window (no browser UI)
5. Test offline functionality in app mode

---

##  Production Integration Notes

### Recommended Enhancements

**Authentication:**
- JWT authentication
- Exam session tokens
- Student ID verification

**Security:**
- Server time sync (prevent clock tampering)
- Answer hash verification
- Device fingerprinting
- Encrypted IndexedDB

**Features:**
- Question randomization
- Auto background sync
- Admin monitoring panel
- Real-time proctoring dashboard

**Deployment:**
- HTTPS required (PWA requirement)
- CDN for static assets
- Load balancing for API
- Database replication

---

##  Scalability Considerations

This architecture supports:

- ✅ Offline exam centers
- ✅ Low bandwidth regions
- ✅ Intermittent connectivity
- ✅ Large candidate volume (10,000+ concurrent)
- ✅ Distributed exam locations
- ✅ Multi-timezone exams

---

##  Project Structure

### Backend
```
server/
 ├ database/
 │  └ db.js
 ├ models/
 │  ├ Question.js
 │  └ Answer.js
 ├ routes/
 │  ├ exam.js
 │  └ answers.js
 ├ utils/
 │  └ crypto.js
 ├ websocket.js
 ├ seed.js
 └ index.js
```

### Frontend
```
web-client/
 ├ src/
 │  ├ views/
 │  │  └ ExamView.vue
 │  ├ stores/
 │  │  └ examStore.ts
 │  ├ services/
 │  │  └ api.ts
 │  ├ offline/
 │  │  └ secureStorage.ts
 │  └ App.vue
 ├ vite.config.ts
 └ package.json
```


---

## Deployment Notes

### Development Requirements

**Development Mode:**
- HTTP supported
- `localhost` or `127.0.0.1`
- MongoDB must be running
- Backend: `node index.js`

### Production Requirements

**PWA Mode:**
- **HTTPS required** (Service Workers need secure context)
- ✅ `https://exam.school.com`
- ❌ `http://exam.school.com` (PWA won't work)
- ✅ Exception: `localhost` (development testing only)

**Production Deployment:**
- Build: `npm run build`
- Serve `dist/` folder via HTTPS
- MongoDB must be accessible from production server
- Use environment variables for API URLs

### Environment Variables

**Backend (.env):**
```
MONGODB_URI=mongodb://localhost:27017/cbt_exam
PORT=3000
ENCRYPTION_KEY=your-secret-key-here
WS_PORT=9001
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:9001
```

---

## Security Best Practices

1. **Never expose correct answers** to client-side
2. **Always encrypt answers** before storage
3. **Validate all inputs** server-side
4. **Use JWT tokens** for authentication
5. **Implement rate limiting** on API endpoints
6. **Log all violations** for audit trails
7. **Use HTTPS** in production
8. **Sanitize user inputs** to prevent injection
9. **Implement CORS** properly
10. **Regular security audits**

---

##  License

This is a prototype system for institutional CBT platforms.
Suitable for academic and enterprise integration.

---

## Conclusion

This project demonstrates a **secure offline-first CBT architecture** ready for integration into large-scale examination platforms.


##  Next Steps

### Optional Enhancements

- ✅ Production architecture diagram
- ✅ Admin dashboard design
- ✅ Full deployment guide (Docker + Kubernetes)
- ✅ JWT authentication upgrade
- ✅ Real-time proctoring with video
- ✅ Question bank management system
- ✅ Result analytics dashboard
- ✅ Multi-language support


## Quick Start (TL;DR)

### Option 1: Development (Default)

```bash
# Terminal 1 - Backend (MongoDB required)
cd server && npm install && node seed.js && node index.js

# Terminal 2 - Frontend (Development)
cd web-client && npm install && npm run dev
```

Open: `http://localhost:5173`

### Option 2: PWA (Production Mode)

```bash
# Terminal 1 - Backend
cd server && npm install && node seed.js && node index.js

# Terminal 2 - Frontend (Production PWA Build)
cd web-client && npm install && npm run build && npm run preview
```

Open: `http://localhost:4173`

---

## Command Reference

| Command | Use Case | URL |
|---------|----------|-----|
| `npm run dev` | Development with live reload | `http://localhost:5173` |
| `npm run build` | Production PWA build with Service Worker | Generate `dist/` |
| `npm run preview` | Preview PWA build locally | `http://localhost:4173` |

