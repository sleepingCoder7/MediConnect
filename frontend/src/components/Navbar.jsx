import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import logo from "../assets/logo/logo-small.png";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiMenu, FiX } from "react-icons/fi";
const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonClass =
        "cursor-pointer transition-colors hover:bg-accent p-2 rounded-md";
    const { user, setUser, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            setIsLoggedIn(true);
        }
    }, [location]);

    const handleLogout = async () => {
        toast.loading('Logging out...', {
            id: 'logout',
        });
        await API.post("/auth/logout", {});
        setUser(null);
        toast.success("Logout successful", {
            id: 'logout',
        });
        setIsLoggedIn(false);
        navigate("/login");
    };

    const handleProtectedNavigation = (path) => {
        if (!user) {
            toast.error("Please login to use this feature", {
                id: "login-required"
            });
            navigate("/login");
            return;
        }

        navigate(path);
    };

    return (
        <nav className="bg-primary text-white flex justify-between items-center px-6 py-3 shadow-md">
            {/* Logo */}
            <div className="flex items-center">
                <Link to="/">
                    <img
                        src={logo}
                        alt="MediConnect"
                        className="h-12 object-contain"
                    />
                </Link>
            </div>

            <div className="hidden md:flex gap-6 items-center font-medium">
                {/* Links */}
                <button onClick={() => handleProtectedNavigation("/book-appointment")} className={buttonClass}>Book Appointment</button>
                <button onClick={() => handleProtectedNavigation("/my-appointment")} className={buttonClass}>My Appointment</button>
                <Link to="/services" className={buttonClass}>Services</Link>

                {/* Auth Buttons */}
                {isLoggedIn ? (
                    <button className={buttonClass} onClick={handleLogout}>
                        Logout
                    </button>
                ) : (
                    <>
                        {location.pathname === "/login" ? (
                            <Link to="/register" className={buttonClass}>
                                Register
                            </Link>
                        ) : (
                            <Link to="/login" className={buttonClass}>
                                Login
                            </Link>
                        )}
                    </>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl p-2 cursor-pointer">
                    {isMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute top-[72px] left-0 w-full bg-primary flex flex-col items-center gap-4 py-6 shadow-xl md:hidden z-50 font-medium">
                    <button onClick={() => { setIsMenuOpen(false); handleProtectedNavigation("/book-appointment"); }} className={buttonClass}>Book Appointment</button>
                    <button onClick={() => { setIsMenuOpen(false); handleProtectedNavigation("/my-appointment"); }} className={buttonClass}>My Appointment</button>
                    <Link to="/services" onClick={() => setIsMenuOpen(false)} className={buttonClass}>Services</Link>

                    {/* Auth Buttons */}
                    {isLoggedIn ? (
                        <button className={buttonClass} onClick={() => { setIsMenuOpen(false); handleLogout(); }}>
                            Logout
                        </button>
                    ) : (
                        <>
                            {location.pathname === "/login" ? (
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className={buttonClass}>
                                    Register
                                </Link>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className={buttonClass}>
                                    Login
                                </Link>
                            )}
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};


export default Navbar;
