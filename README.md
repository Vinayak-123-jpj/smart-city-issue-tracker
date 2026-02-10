# 🏙️ Smart City Issue Tracker

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://smart-city-issue-tracker.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker)
[![Backend](https://img.shields.io/badge/Backend-Live-blue?style=for-the-badge&logo=render)](https://smart-city-backend-ja4.onrender.com)

> **A Modern MERN Stack Application for Reporting and Tracking Civic Issues**

Empowering citizens and authorities to collaborate seamlessly on community problems with real-time tracking, AI-powered insights, and geospatial mapping.

---

## 🌟 Live Links

| Service | URL | Status |
|---------|-----|--------|
| **🌐 Frontend (Production)** | [smart-city-issue-tracker.vercel.app](https://smart-city-issue-tracker.vercel.app) | ✅ Live |
| **🔧 Backend API** | [smart-city-backend-ja4.onrender.com](https://smart-city-backend-ja4.onrender.com/api/health) | ✅ Live |
| **📂 GitHub Repository** | [Vinayak-123-jpi/smart-city-issue-tracker](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker) | 📦 Public |

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
- ✨ **Description Enhancement** - Improve issue descriptions with AI (Google Gemini)
- 🔍 **Duplicate Detection** - Prevent duplicate issue submissions
- 📊 **Priority Analysis** - Automatic urgency scoring (1-10)
- 💡 **Smart Suggestions** - Context-aware recommendations
- 😊 **Sentiment Analysis** - Detect user frustration levels

---

## 🛠️ Technology Stack

### Frontend
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat&logo=leaflet&logoColor=white)

- **React 18** - Modern UI with hooks and context
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Leaflet** - Interactive maps
- **React Hot Toast** - Beautiful notifications

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?style=flat&logo=cloudinary&logoColor=white)

- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Google Gemini AI** - AI-powered features
- **CORS** - Cross-origin resource sharing

### DevOps & Deployment
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat&logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)

- **Vercel** - Frontend hosting with automatic deployments
- **Render** - Backend hosting with free tier
- **MongoDB Atlas** - Cloud database (free tier M0)
- **GitHub** - Version control and CI/CD

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
# Or for production
npm start
```

✅ Backend runs on: `http://localhost:5000`

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

✅ Frontend runs on: `http://localhost:5173`

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
│   │   ├── issueController.js   # Issue CRUD operations
│   │   ├── commentController.js # Comment operations
│   │   └── aiController.js      # AI features (Gemini)
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── roleMiddleware.js    # Role-based access control
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
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── CategoryBadge.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   ├── ConfirmModal.jsx
│   │   │   │   ├── MapPicker.jsx
│   │   │   │   ├── MapView.jsx
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── AIPriorityBadge.jsx
│   │   │   │   └── AIChatbot.jsx
│   │   │   ├── issues/          # Issue-related components
│   │   │   │   ├── IssueCard.jsx
│   │   │   │   ├── IssueFilters.jsx
│   │   │   │   ├── CreateIssueForm.jsx
│   │   │   │   ├── IssueTimeline.jsx
│   │   │   │   ├── CommentsSection.jsx
│   │   │   │   └── MyIssuesPage.jsx
│   │   │   └── layout/          # Layout components
│   │   │       ├── Navbar.jsx
│   │   │       └── HeroSection.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Auth state management
│   │   │   └── DarkModeContext.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Axios API client
│   │   │   └── aiService.js     # AI service functions
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Environment variables
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### Issues
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/issues` | Get all issues (with filters) | ✅ |
| GET | `/api/issues/:id` | Get single issue | ✅ |
| POST | `/api/issues` | Create issue | ✅ Citizen |
| PUT | `/api/issues/:id` | Update issue status | ✅ Authority |
| DELETE | `/api/issues/:id` | Delete issue | ✅ Authority |
| PUT | `/api/issues/:id/upvote` | Toggle upvote | ✅ Citizen |
| GET | `/api/issues/user/my-issues` | Get user's issues | ✅ Citizen |
| GET | `/api/issues/nearby` | Get nearby issues | ✅ |
| GET | `/api/issues/stats/analytics` | Get analytics | ✅ Authority |

### AI Features
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/improve-description` | Enhance description with AI | ✅ |
| POST | `/api/ai/check-duplicates` | Check for duplicate issues | ✅ |
| POST | `/api/ai/analyze-priority` | AI priority analysis | ✅ |
| POST | `/api/ai/suggest-title` | Generate title suggestions | ✅ |

### Comments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/issues/:issueId/comments` | Get all comments | ✅ |
| POST | `/api/issues/:issueId/comments` | Add comment | ✅ |
| DELETE | `/api/comments/:id` | Delete comment | ✅ |

---

## 🎨 Features in Detail

### 📝 Issue Reporting Flow
1. **Rich Form** - Title, description, category, location
2. **Image Upload** - Photos stored securely on Cloudinary
3. **Interactive Map Picker** - Pin exact location using Leaflet
4. **AI Enhancement** - One-click description improvement
5. **Duplicate Detection** - AI checks for similar existing issues
6. **Real-time Validation** - Instant feedback on form inputs

### 🗺️ Interactive Maps
- **Leaflet Integration** - Powered by OpenStreetMap
- **Custom Markers** - Color-coded by status (Pending/In Progress/Resolved)
- **Search Places** - Find locations by name or address
- **Current Location** - Use device GPS
- **Nearby Issues** - Filter by radius (default 10km)
- **Popup Details** - Click markers to view issue summaries

### 📊 Analytics Dashboard (Authority)
- **Overview Cards** - Total, pending, in-progress, resolved counts
- **Category Distribution** - Visual breakdown by issue type
- **Resolution Rate** - Performance metrics and trends
- **Top Upvoted Issues** - Most supported problems
- **Time-based Analysis** - Issues over last 30 days

### 🤖 AI Chat Assistant
- **Context-Aware Responses** - Understands user questions
- **Quick Actions** - Common task shortcuts
- **24/7 Availability** - Always ready to help
- **Friendly Interface** - Chat bubble with animations

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based auth with 30-day expiry
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **Role-Based Access Control** - Citizen vs Authority permissions
- ✅ **Input Validation** - Mongoose schema validation
- ✅ **CORS Protection** - Whitelist specific origins
- ✅ **Environment Variables** - Sensitive data in .env files
- ✅ **HTTP-Only Cookies** - XSS attack prevention
- ✅ **Rate Limiting** - Prevent abuse (AI APIs)

---

## 🌈 User Roles

### 👤 Citizen
**Permissions:**
- ✅ Report issues with photos and location
- ✅ View all community issues
- ✅ Upvote/downvote issues
- ✅ Comment on issues
- ✅ Track own submissions
- ✅ Delete own pending issues
- ✅ Receive notifications
- ❌ Cannot update issue status
- ❌ Cannot delete others' issues

### 🛡️ Authority
**Permissions:**
- ✅ View all reported issues
- ✅ Update issue status (Pending → In Progress → Resolved)
- ✅ Delete any issue
- ✅ Access analytics dashboard
- ✅ Filter by category/status/location
- ✅ Upload completion photos
- ✅ Post official comments
- ✅ Export reports
- ❌ Cannot report new issues (read-only citizen view)

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['citizen', 'authority'], required),
  phone: String,
  address: String,
  createdAt: Date (auto)
}
```

### Issue Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (required, max 2000 chars),
  category: String (enum: Roads, Water Supply, Electricity, etc.),
  location: String (required),
  latitude: Number (-90 to 90),
  longitude: Number (-180 to 180),
  status: String (enum: Pending, In Progress, Resolved),
  reportedBy: ObjectId (ref: User, required),
  imageUrl: String (Cloudinary URL),
  completionImageUrl: String,
  upvoteCount: Number (default: 0),
  upvotedBy: [ObjectId] (refs: User),
  commentCount: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Comment Model
```javascript
{
  issue: ObjectId (ref: Issue, required),
  user: ObjectId (ref: User, required),
  text: String (required, max 500 chars),
  isOfficial: Boolean (true if authority),
  createdAt: Date (auto)
}
```

---

## 🤝 Contributing

Contributions make the open-source community amazing! Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-city-issue-tracker.git
   ```

2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Contribution Guidelines
- Write clean, maintainable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 🐛 Known Issues & Limitations

### Performance
- ⚠️ **Backend Cold Start** - Render free tier: first request may take 30-60 seconds
- ⚠️ **Image Upload Limit** - Cloudinary free tier: 500 uploads/month, 10MB max
- ⚠️ **AI Rate Limits** - Google Gemini: 60 requests/minute on free tier

### Browser Support
- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE 11 (not supported)

### Mobile
- ✅ Responsive design works on all screen sizes
- ⚠️ Map picker may be less precise on small screens
- 📱 Native mobile app coming in Phase 2

---

## 📝 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

```bash
# Run backend tests (if configured)
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Check for linting errors
npm run lint
```

---

## 📦 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy automatically

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service in Render
3. Connect repository
4. Set environment variables
5. Deploy

### Database (MongoDB Atlas)
1. Create free M0 cluster
2. Whitelist IP addresses (0.0.0.0/0 for all)
3. Create database user
4. Get connection string

---

---

## 👨‍💻 Author

**Vinayak Dhyani**

- 📧 Email: vinayakdhyani27@gmail.com
- 💼 LinkedIn: [linkedin.com/in/vinayak-dhyani](https://www.linkedin.com/in/vinayak-dhyani-18b547373/)
- 🐙 GitHub: [@Vinayak-123-jpi](https://github.com/Vinayak-123-jpi)


---

## 🙏 Acknowledgments

- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database hosting (free tier)
- **[Vercel](https://vercel.com)** - Frontend deployment platform
- **[Render](https://render.com)** - Backend hosting service
- **[Cloudinary](https://cloudinary.com)** - Image hosting and optimization
- **[Google Gemini](https://ai.google.dev/)** - AI capabilities (free tier)
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Map data provider
- **[Leaflet](https://leafletjs.com/)** - Interactive map library
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React](https://react.dev/)** - UI library
- **[Express](https://expressjs.com/)** - Backend framework

Special thanks to the open-source community! 🎉

---

## 📞 Support

For support and questions:

- 📧 Email: vinayakdhyani@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/discussions)

---

## ⭐ Show Your Support

If this project helped you or you find it useful, please consider:

- ⭐ **Star this repository** on GitHub
- 🍴 **Fork it** and contribute
- 📢 **Share it** with others
- 🐛 **Report bugs** or suggest features

[![GitHub stars](https://img.shields.io/github/stars/Vinayak-123-jpi/smart-city-issue-tracker?style=social)](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker)
[![GitHub forks](https://img.shields.io/github/forks/Vinayak-123-jpi/smart-city-issue-tracker?style=social)](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/fork)

---

<div align="center">

### 🏗️ Built with ❤️ by Vinayak Dhyani

**[Live Demo](https://smart-city-issue-tracker.vercel.app)** • 
**[Report Bug](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/issues)** • 
**[Request Feature](https://github.com/Vinayak-123-jpi/smart-city-issue-tracker/issues)**

---

**Made in 🇮🇳 India** | **Powered by MERN Stack** | **© 2024-2026 Vinayak Dhyani**

</div>
