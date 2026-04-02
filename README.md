# <img src="./frontend/public/logo-icon-64.png" alt="MediConnect Logo" align="center" /> MediConnect

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

MediConnect is a modern, full-stack web application designed to seamlessly connect patients with healthcare services. Built with the **MERN** stack (MongoDB, Express, React, Node.js), it provides a secure and intuitive platform for users to manage their health appointments, view available services, and securely upload medical documents.

---

## ✨ Features

- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens) and HTTP-only cookies, featuring **Google OAuth** for quick social sign-in.
- **Appointment Booking:** Users can easily book doctor appointments for multiple departments.
- **Personalized Dashboard:** A dedicated space for users to manage their profile and track up-to-date upcoming and past appointments.
- **Secure File Uploads:** Uploads for medical documents handled securely through **Cloudinary** and **Multer**.
- **Modern & Responsive UI:** A premium, fully responsive user interface built using the latest **React 19**, **Vite**, and **Tailwind CSS v4**.
- **State Management:** Efficient client-side state management using **Redux Toolkit**.
- **Interactive Notifications:** Toast notifications built with `react-hot-toast` for real-time user feedback.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & `react-redux`
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Icons & UI:** `react-icons`, `react-hot-toast`

### Backend
- **Framework:** [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Authentication:** `jsonwebtoken` (JWT), `bcryptjs`, `cookie-parser`, **Google OAuth 2.0**
- **File Uploads:** `multer`, `cloudinary`
- **Other utilities:** `dotenv`, `cors`

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [MongoDB](https://www.mongodb.com/) account/database URI
- A [Cloudinary](https://cloudinary.com/) account for image & document hosting
- Google Cloud Console set up with OAuth credentials (Client ID and Secret)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/MediConnect.git
cd MediConnect
```

### 2. Install Dependencies

The project is structured into `frontend` and `backend` directories. You will need to install dependencies in all relevant folders:

```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Variables Setup

Navigate to the `backend/` directory and create a `.env` file based on the environment structure:

```env
# backend/.env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_key
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Navigate to the `frontend/` directory and create a `.env` file based on the environment structure:

```env
# frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run the Application

From the **root folder** of the project, run the main development script. This will start both the frontend and backend development servers concurrently.

```bash
# Starts both frontend and backend
npm run dev
```

- Follow the terminal output for local URLs. Typically:
  - Frontend: `http://localhost:5173`
  - Backend API: `http://localhost:5000`

---

## 📁 Project Structure

```text
MediConnect/
├── backend/                  # Node.js/Express Server
│   ├── config/               # DB and External config (Cloudinary)
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth and validation middleware
│   ├── models/               # Mongoose schemas (User, Appointment, Department)
│   ├── routes/               # Express API routes
│   ├── server.js             # Entry point
│   └── package.json
├── frontend/                 # React/Vite Client
│   ├── src/                  
│   │   ├── api/              # Axios API setup
│   │   ├── assets/           # Static files (Logos/Images)
│   │   ├── components/       # Reusable React components (Navbar, Footer, etc.)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # View pages (Dashboard, Login, BookAppointment)
│   │   ├── redux/            # RTK Slices and Store configuration
│   │   └── App.jsx           # Main routing component
│   └── package.json
├── package.json              # Root config for concurrently
└── README.md
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the **MIT License**.
