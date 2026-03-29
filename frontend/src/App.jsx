import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import MyAppointment from "./pages/MyAppointment";
import Services from "./pages/Services";
import HomeRedirect from "./components/HomeRedirect";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router";

function App() {
    const { user, loading } = useAuth();

    if(loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-secondary font-medium animate-pulse">
                        Loading ...
                    </p>
                </div>
            </div>
        );
    }
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="grow">
                    <Routes>
                        <Route path="/" element={<HomeRedirect />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={!loading && user ? <Dashboard /> : <Navigate to="/login" replace/>} />
                        <Route path="/dashboard/profile" element={!loading && user ? <Dashboard /> : <Navigate to="/login" replace/>} />
                        <Route path="/book-appointment" element={!loading && user ? <BookAppointment /> : <Navigate to="/login" replace/>} />
                        <Route path="/my-appointment" element={!loading && user ? <MyAppointment /> : <Navigate to="/login" replace/>} />
                        <Route path="/services" element={<Services />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
