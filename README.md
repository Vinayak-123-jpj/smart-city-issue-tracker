# 🏙️ Smart City Issue Tracker

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://smart-city-issue-tracker.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker)
[![Backend](https://img.shields.io/badge/Backend-Live-blue?style=for-the-badge)](https://smart-city-backend-ja4.onrender.com)

> **A Modern MERN Stack Application for Reporting and Tracking Civic Issues**

Empowering citizens and authorities to collaborate seamlessly on community problems with real-time tracking, AI-powered insights, and geospatial mapping.

---

## 🌟 Live Links

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Production)** | [smart-city-issue-tracker.vercel.app](https://smart-city-issue-tracker.vercel.app) | ✅ Live |
| **Backend API** | [smart-city-backend-ja4.onrender.com](https://smart-city-backend-ja4.onrender.com/api/health) | ✅ Live |
| **GitHub Repository** | [Vinayak-123-jpi/smart-city-issue-tracker](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker) | 📂 Public |

---

## 📸 Screenshots

### GitHub Repository
![GitHub Repository](https://i.imgur.com/screenshot1.png)

### Backend Deployment (Render)
![Backend Deployment](https://i.imgur.com/screenshot2.png)

### Frontend Deployment (Vercel)
![Frontend Deployment](https://i.imgur.com/screenshot3.png)

---

## ✨ Key Features

### 👥 **For Citizens**
- 📝 **Report Issues** - Submit civic problems with photos, location, and detailed descriptions
- 🗺️ **Interactive Map** - View all issues on an interactive map with geolocation
- 👍 **Upvote System** - Support important issues to increase their priority
- 📊 **Track Status** - Monitor your reported issues from submission to resolution
- 🤖 **AI-Powered Assistance** - Get writing help and duplicate detection
- 💬 **Comments** - Engage in discussions about community issues
- 🔔 **Real-time Notifications** - Stay updated on issue status changes

### 🛡️ **For Authorities**
- 📈 **Analytics Dashboard** - Comprehensive insights into all reported issues
- 🗺️ **Map View** - Visualize issue distribution across the city
- ⚡ **Priority Management** - AI-assisted priority analysis
- 📊 **Status Updates** - Manage issue workflow (Pending → In Progress → Resolved)
- 📁 **Category Filtering** - Organize issues by type (Roads, Water, Electricity, etc.)
- 📸 **Completion Photos** - Upload proof of resolved issues

### 🤖 **AI Features**
- ✨ **Description Enhancement** - Improve issue descriptions with AI
- 🔍 **Duplicate Detection** - Prevent duplicate issue submissions
- 📊 **Priority Analysis** - Automatic urgency scoring (1-10)
- 💡 **Smart Suggestions** - Context-aware recommendations
- 😊 **Sentiment Analysis** - Detect user frustration levels

---

## 🛠️ Technology Stack

### Frontend
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-cyan?logo=tailwindcss)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-green?logo=leaflet)

- **React 18** - Modern UI with hooks and context
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Leaflet** - Interactive maps
- **React Hot Toast** - Beautiful notifications

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?logo=mongodb)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-blue?logo=cloudinary)

- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Google Gemini AI** - AI-powered features
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-blue?logo=render)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)

- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Cloud database
- **GitHub** - Version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB account (Atlas or local)
- Cloudinary account (for image uploads)
- Google Gemini API key (for AI features)

### 🔧 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Vinayak-123-jpi/smart-city-issue-tracker.git
cd smart-city-issue-tracker
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📁 Project Structure

```
smart-city-issue-tracker/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary configuration
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── issueController.js   # Issue CRUD
│   │   ├── commentController.js # Comments
│   │   └── aiController.js      # AI features
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── roleMiddleware.js    # Role-based access
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Issue.js             # Issue schema
│   │   └── Comment.js           # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── issueRoutes.js       # Issue endpoints
│   │   ├── commentRoutes.js     # Comment endpoints
│   │   └── aiRoutes.js          # AI endpoints
│   ├── .env                     # Environment variables
│   ├── server.js                # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI components
│   │   │   ├── issues/          # Issue-related components
│   │   │   └── layout/          # Layout components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Auth state management
│   │   │   └── DarkModeContext.jsx
│   │   ├── services/
│   │   │   ├── api.js           # API client
│   │   │   └── aiService.js     # AI service
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Environment variables
│   ├── vite.config.js           # Vite configuration
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Issues
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/issues` | Get all issues | ✅ |
| GET | `/api/issues/:id` | Get single issue | ✅ |
| POST | `/api/issues` | Create issue | ✅ Citizen |
| PUT | `/api/issues/:id` | Update issue status | ✅ Authority |
| DELETE | `/api/issues/:id` | Delete issue | ✅ Authority |
| PUT | `/api/issues/:id/upvote` | Upvote issue | ✅ Citizen |
| GET | `/api/issues/user/my-issues` | Get user's issues | ✅ Citizen |
| GET | `/api/issues/nearby` | Get nearby issues | ✅ |

### AI Features
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/improve-description` | Enhance description | ✅ |
| POST | `/api/ai/check-duplicates` | Check duplicates | ✅ |
| POST | `/api/ai/analyze-priority` | Analyze priority | ✅ |
| POST | `/api/ai/suggest-title` | Suggest titles | ✅ |

### Comments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/issues/:issueId/comments` | Get comments | ✅ |
| POST | `/api/issues/:issueId/comments` | Add comment | ✅ |
| DELETE | `/api/comments/:id` | Delete comment | ✅ |

---

## 🎨 Features in Detail

### 📝 Issue Reporting
1. **Rich Form** - Title, description, category, location
2. **Image Upload** - Photos stored on Cloudinary
3. **Map Picker** - Pin exact location on interactive map
4. **AI Enhancement** - Improve descriptions with AI
5. **Duplicate Check** - Prevent duplicate submissions

### 🗺️ Interactive Maps
- **Leaflet Integration** - OpenStreetMap powered
- **Marker Clustering** - Group nearby issues
- **Custom Icons** - Status-based marker colors
- **Search Location** - Find places by name
- **Geolocation** - Use current location
- **Distance Filtering** - Find issues within radius

### 📊 Analytics Dashboard
- **Overview Stats** - Total, pending, in-progress, resolved
- **Category Breakdown** - Issues by category
- **Timeline Charts** - Issues over time
- **Resolution Rate** - Performance metrics
- **Top Issues** - Most upvoted problems

### 🤖 AI Chat Assistant
- **24/7 Help** - Always available support
- **Smart Responses** - Context-aware answers
- **Quick Actions** - Common tasks shortcuts
- **Multilingual** - Support for multiple languages

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt encryption
- ✅ **Role-Based Access** - Citizen vs Authority permissions
- ✅ **Input Validation** - Prevent injection attacks
- ✅ **CORS Protection** - Controlled cross-origin requests
- ✅ **Environment Variables** - Sensitive data protection

---

## 🌈 User Roles

### 👤 Citizen
- Report issues with photos and location
- View all community issues
- Upvote important issues
- Comment on issues
- Track own submissions
- Receive notifications

### 🛡️ Authority
- View all reported issues
- Update issue status
- Access analytics dashboard
- Filter by category/status
- Upload completion photos
- Manage comments

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (citizen/authority),
  phone: String,
  address: String,
  createdAt: Date
}
```

### Issue Model
```javascript
{
  title: String,
  description: String,
  category: String (enum),
  location: String,
  latitude: Number,
  longitude: Number,
  status: String (Pending/In Progress/Resolved),
  reportedBy: ObjectId (ref: User),
  imageUrl: String,
  completionImageUrl: String,
  upvoteCount: Number,
  upvotedBy: [ObjectId],
  commentCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  issue: ObjectId (ref: Issue),
  user: ObjectId (ref: User),
  text: String,
  isOfficial: Boolean,
  createdAt: Date
}
```

---

## 🎯 Roadmap

- [ ] Push Notifications (PWA)
- [ ] Email Notifications
- [ ] Advanced Analytics (Charts & Graphs)
- [ ] Export Reports (PDF/CSV)
- [ ] Mobile App (React Native)
- [ ] Multi-language Support
- [ ] Dark Mode Improvements
- [ ] Social Sharing
- [ ] Issue Categories Expansion
- [ ] Machine Learning Predictions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues

- Backend cold start on Render (first request may take 30-60 seconds)
- Free tier rate limits on Cloudinary (500 uploads/month)
- Google Gemini API rate limits (60 requests/minute)

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Vinayak Dhyani**

- GitHub: [@Vinayak-123-jpi](https://github.com/Vinayak-123-jpi)
- LinkedIn: [Connect with me](https://linkedin.com/in/vinayak-dhyani)
- Email: vinayakdhyani@example.com

---

## 🙏 Acknowledgments

- **MongoDB Atlas** - Cloud database hosting
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **Cloudinary** - Image hosting
- **Google Gemini** - AI capabilities
- **OpenStreetMap** - Map data
- **Leaflet** - Map library
- **TailwindCSS** - Styling framework

---

## 📞 Support

For support, email vinayakdhyani@example.com or create an issue on GitHub.

---

## ⭐ Star this repository

If you find this project helpful, please give it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/Vinayak-123-jpi/smart-city-issue-tracker?style=social)](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker)

---

<div align="center">

**Built with ❤️ by Vinayak Dhyani**

[Live Demo](https://smart-city-issue-tracker.vercel.app) • [Report Bug](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/issues) • [Request Feature](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/issues)

</div>
