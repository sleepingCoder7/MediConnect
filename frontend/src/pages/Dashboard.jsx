import React, { useState, useEffect } from "react";
import { FiUser, FiPhone, FiMail, FiCalendar, FiMapPin, FiHome } from "react-icons/fi";
import { FaUser, FaSave, } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import bgImage from "../assets/background/MediConnect-Building-background.png";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router";

const Dashboard = () => {
    const { user, setUser } = useAuth();
    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary";
    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zipcode: "",
    });
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const showForm = location.pathname === "/dashboard/profile";
    

    const handleChange = (e) => {
        setFormValues((prevFormData) => ({
            ...prevFormData,
            [e.target.name]: e.target.value,
        }));
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const response = await API.get("/auth/me");
        setUser(response?.data?.user);
    };

    useEffect(() => {
        if (user) {
            updateFormValues();
        }
    }, [user]);

    const handlePhoneChange = (e) => {
        setFormValues((prevFormValues) => ({
            ...prevFormValues,
            [e.target.name]: e.target.value,
        }));
        const value = e.target.value;
        if (!/^[0-9]*$/.test(value)) {
            setErrors({...errors, "phone": "Phone number must contain only numbers"});
            return;
        }
        if (value.length < 10) {
            setErrors({...errors, "phone": "Phone number must be at least 10 digits"});
            return;
        }
        const {phone, ...remainingErrors} = errors;
        setErrors(remainingErrors);
    };

    const handleZipcodeChange = (e) => {
        setFormValues((prevFormValues) => ({
            ...prevFormValues,
            [e.target.name]: e.target.value,
        }));
        const value = e.target.value;
        if (!/^[0-9]*$/.test(value)) {
            setErrors({...errors, "zipcode": "Zipcode must contain only numbers"});
            return;
        }
        if (value.length < 6) {
            setErrors({...errors, "zipcode": "Zipcode must be at least 6 digits"});
            return;
        }
        const {zipcode, ...remainingErrors} = errors;
        setErrors(remainingErrors);
    };

    const updateFormValues = () => {
        setFormValues({
            firstName: user.profile?.firstName || "",
            lastName: user.profile?.lastName || "",
            gender: user.profile?.gender || "",
            dateOfBirth: user.profile?.dateOfBirth || "",
            email: user.email || "",
            phone: user.profile?.phone || "",   
            line1: user.address?.line1 || "",
            line2: user.address?.line2 || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipcode: user.address?.zipcode || "",
        });
    };

    const revertChanges = () => {
        updateFormValues();
        setErrors({});
        toast.success("Changes reverted",
            {id: "revertChanges"}
        );
    };

    const saveChanges = async () => {
        if(Object.keys(errors).length > 0){
            toast.error("Please fix the errors before saving",
                {id: "saveChanges"}
            );
            return;
        }
        toast.loading("Updating profile...",
            {id: "saveChanges"}
        );
        const updatedUser = await API.put("/user/update", formValues)
            .then((response) => {
                toast.success("Profile updated successfully",
                    {id: "saveChanges"}
                );
                setUser(response.data.user);
            })
            .catch((error) => {
                toast.error("Failed to update profile",
                    {id: "saveChanges"}
                );
            });
    };

    return (
        <div className="flex min-h-screen bg-cover bg-center" style={{backgroundImage: `url(${bgImage})`}}>
            <Sidebar />
            
            {/* Main Content */}
            {showForm ? (
                <main className="flex-1 p-6">


                    {/* Profile Form */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 overflow-x-auto">
                        <header>
                            <h1 className="text-2xl font-bold text-primary mb-6">
                                Welcome back, {user?.profile?.firstName || user?.name || "Patient"}
                            </h1>
                        </header>
                        {/* Form Heading */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                                <FaUser size={20} color="#007bff" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">Patient Details</h2>
                                <p className="text-sm text-secondary">Update your profile information</p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form >
                            {/* Personal Information */}
                            <div className="mb-6">
                                <div className="mb-1">
                                    <h3 className="font-semibold text-primary uppercase tracking-wider">Personal Information</h3>
                                </div>
                                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiUser size={16} color="#007bff" /></span>
                                            <label htmlFor="firstName">First Name</label>
                                        </div>
                                        <input type="text" id="firstName" name="firstName" className={inputClass} value={formValues.firstName} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiUser size={16} color="#007bff" /></span>
                                            <label htmlFor="lastName">Last Name</label>
                                        </div>
                                        <input type="text" id="lastName" name="lastName" className={inputClass} value={formValues.lastName} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiUser size={16} color="#007bff" /></span>
                                            <label htmlFor="gender">Gender</label>
                                        </div>
                                        <select id="gender" name="gender" className={inputClass} value={formValues.gender} onChange={handleChange}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiCalendar size={16} color="#007bff" /></span>
                                            <label htmlFor="dateOfBirth">Date of Birth</label>
                                        </div>
                                        <input type="date" id="dateOfBirth" name="dateOfBirth" className={inputClass} value={formValues.dateOfBirth?.split("T")[0]} max={new Date().toISOString().split("T")[0]} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiMail size={16} color="#007bff" /></span>
                                            <label htmlFor="email">Email</label>
                                        </div>
                                        <input type="email" id="email" name="email" className={inputClass} value={formValues.email} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiPhone size={16} color="#007bff" /></span>
                                            <label htmlFor="phone">Phone</label>
                                        </div>
                                        <input type="text" minLength={10} maxLength={10} id="phone" name="phone" className={`${inputClass} ${errors.phone ? "border-red-500" : ""}`} value={formValues.phone} onChange={handlePhoneChange} />
                                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="mb-5">
                                <div className="mb-1">
                                    <h3 className="font-semibold text-primary uppercase tracking-wider">Address Information</h3>
                                </div>
                                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiHome size={16} color="#007bff" /></span>
                                            <label htmlFor="line1">Address Line 1</label>
                                        </div>
                                        <input type="text" id="line1" name="line1" className={inputClass} value={formValues.line1} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiHome size={16} color="#007bff" /></span>
                                            <label htmlFor="line2">Address Line 2</label>
                                        </div>
                                        <input type="text" id="line2" name="line2" className={inputClass} value={formValues.line2} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiMapPin size={16} color="#007bff" /></span>
                                            <label htmlFor="city">City</label>
                                        </div>
                                        <input type="text" id="city" name="city" className={inputClass} value={formValues.city} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiMapPin size={16} color="#007bff" /></span>
                                            <label htmlFor="state">State</label>
                                        </div>
                                        <input type="text" id="state" name="state" className={inputClass} value={formValues.state} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5"><FiMapPin size={16} color="#007bff" /></span>
                                            <label htmlFor="zipcode">ZipCode</label>
                                        </div>
                                        <input type="text" minLength={6} maxLength={6} id="zipcode" name="zipcode" className={`${inputClass} ${errors.zipcode ? "border-red-500" : ""}`} value={formValues.zipcode} onChange={handleZipcodeChange} />
                                        {errors.zipcode && <p className="text-red-500 text-sm">{errors.zipcode}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Save Changes Button */}
                            <div className="flex items-center gap-2 justify-end mt-5 p-4">
                                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors cursor-pointer" onClick={revertChanges}>
                                    Revert Changes
                                </button>
                                <button type="button" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer" onClick={saveChanges}>
                                    <FaSave size={20} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            ) : (
                <main className="flex-1 p-6 relative" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                            Welcome to MediConnect
                        </h1>
                        <p className="text-white text-xl md:text-3xl drop-shadow mt-6">
                            Your one-stop solution for all healthcare needs.
                        </p>
                    </div>
                </main>
            )}
        </div>
    );
};

export default Dashboard;
