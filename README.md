# 🎓 StudentHub — Comprehensive Student Achievement & Profile Management System

A full-stack web application built with **React**, **Node.js**, and **MongoDB** with **AI-powered features** using Claude API.

---

## 🚀 Features

### Student Features
- **Complete Profile Management** — Personal, contact, academic, and parent details
- **Achievement Repository** — Hackathons, internships, research publications, competitions, sports, cultural events
- **Document Repository** — Secure storage for Aadhaar, PAN, mark memos, certificates, and more
- **Semester Results** — Track SGPA, CGPA across all semesters
- **AI Assistant** powered by Claude:
  - Profile Analysis & Career Readiness Score
  - Resume Content Generator
  - Opportunity Recommendations
  - Achievement Summarizer

### Admin Features
- **Admin Dashboard** — System-wide statistics and pending verifications
- **Student Search** — Complete profile lookup by registration number
- **Achievement Verification** — Approve/reject with notes
- **Document Verification** — Verify submitted documents
- **Analytics & Reports** — Category, level, and program distributions
- **AI Accreditation Report** — NAAC/NBA ready report generation
- **Student Management** — Activate/deactivate accounts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Multer |
| AI | Anthropic Claude API |
| Styling | Custom CSS with CSS Variables |

---

## 📦 Project Structure

```
student-management/
├── backend/
│   ├── models/
│   │   ├── Student.js         # User + student schema
│   │   ├── Achievement.js     # Achievement schema
│   │   └── Document.js        # Document schema
│   ├── routes/
│   │   ├── auth.js            # Login, register, JWT
│   │   ├── students.js        # Student profile CRUD
│   │   ├── achievements.js    # Achievement CRUD
│   │   ├── documents.js       # Document upload/manage
│   │   ├── admin.js           # Admin operations
│   │   └── ai.js              # AI/Claude integration
│   ├── middleware/
│   │   ├── auth.js            # JWT middleware
│   │   └── upload.js          # Multer config
│   ├── uploads/               # Stored files (auto-created)
│   ├── server.js              # Express app entry
│   ├── seed-admin.js          # Admin account seeder
│   └── .env                   # Environment variables
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   └── Layout.js       # Sidebar + navigation
        ├── context/
        │   └── AuthContext.js  # Auth state management
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── Profile.js
        │   ├── Achievements.js
        │   ├── AddAchievement.js
        │   ├── Documents.js
        │   ├── AIAssistant.js
        │   ├── AdminDashboard.js
        │   ├── AdminStudentSearch.js
        │   └── AdminAnalytics.js
        ├── utils/
        │   └── api.js          # Axios API client
        ├── App.js
        └── index.css           # Global styles
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone & Install

```bash
# Install backend dependencies
cd student-management/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Get your Anthropic API key:** https://console.anthropic.com

### Step 3: Seed Admin Account

```bash
cd backend
node seed-admin.js
```

This creates:
- Email: `admin@college.edu`
- Password: `admin123`

### Step 4: Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev   # or: npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

### Step 5: Access the App

Open: **http://localhost:3000**

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students/profile` | Get own profile |
| PUT | `/api/students/profile` | Update profile |
| GET | `/api/students/dashboard` | Dashboard stats |
| GET | `/api/students/achievements` | List achievements |
| GET | `/api/students/documents` | List documents |

### Achievements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/achievements` | Create achievement |
| GET | `/api/achievements/:id` | Get achievement |
| PUT | `/api/achievements/:id` | Update achievement |
| DELETE | `/api/achievements/:id` | Delete achievement |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents` | List documents |
| DELETE | `/api/documents/:id` | Remove document |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/student/:regNo` | Search student |
| GET | `/api/admin/students` | List all students |
| GET | `/api/admin/analytics` | Analytics data |
| GET | `/api/admin/achievements/pending` | Pending verifications |
| PUT | `/api/admin/achievement/:id/verify` | Verify achievement |
| PUT | `/api/admin/document/:id/verify` | Verify document |

### AI (requires Anthropic API key)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/achievement-summary` | Generate AI summary |
| POST | `/api/ai/profile-analysis` | Analyze profile |
| POST | `/api/ai/generate-resume-content` | Generate resume content |
| POST | `/api/ai/recommendations` | Get recommendations |
| POST | `/api/ai/accreditation-report` | NAAC/NBA report |

---

## 🎯 Achievement Categories

- 💻 Hackathon
- 🏢 Internship
- 📄 Research Publication
- ⚡ Technical Competition
- 🎭 Cultural Activity
- 🏅 Sports
- 🎓 Workshop / Seminar
- 📜 Certification
- 🚀 Project
- 🏆 Award / Recognition

## 📋 Document Types

- 📊 Mark Memos (per semester)
- 🪪 Aadhaar Card
- 💳 PAN Card
- 🗳️ Voter ID
- 🎓 APAAR / ABC ID
- 📘 Passport
- 📃 Birth Certificate
- 📋 Transfer Certificate
- 💰 Income Certificate
- 📜 Caste Certificate
- And more...

---

## 🌐 Deployment

### MongoDB Atlas (Cloud)
Replace `MONGODB_URI` in `.env` with your Atlas connection string.

### Environment for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/student_mgmt
JWT_SECRET=very_long_random_secret_here
```

---

## 📝 License

MIT License — Free to use for educational institutions.
