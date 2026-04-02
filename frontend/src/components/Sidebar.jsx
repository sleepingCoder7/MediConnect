import React, { useState, useEffect } from "react";
import { FiMenu, FiLogOut, FiEdit } from "react-icons/fi";
import { FaHome } from "react-icons/fa";
import defaultProfilePic from "../assets/profileImages/default.jpg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import API from "../api/axios";
import toast from "react-hot-toast";

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const response = await API.get("/auth/me");
        setUser(response.data.user);
    };

    const handleLogout = async () => {
        toast.loading("Logging out...", {
            id: "logout",
        });
        await API.post("/auth/logout", {});
        setUser(null);
        toast.success("Logout successful", {
            id: "logout",
        });
        navigate("/login");
    };

    const handleProfilePicChange = async (e) => {
        //Store image in assets/profileImages folder
        const file = e.target.files[0];
        if(file){
            toast.loading("Updating profile picture...",
                {id: "saveChanges"}
            );
            const formData = new FormData();
            formData.append("profilePic", file);

            try{
                const response = await API.post("/user/upload-profile-pic", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                });
                setUser(response.data.user);
                toast.success("Profile picture updated successfully",
                    {id: "saveChanges"}
                );
            }catch(error){
                toast.error("Failed to update profile picture",
                    {id: "saveChanges"}
                );
            }
        }
    };

  return (
    <>
        {/* Floating Menu Button */}
        {!isSidebarOpen && (
            <button
                className="md:hidden fixed top-4 left-4 z-50 text-white bg-primary hover:bg-accent p-2 rounded-lg cursor-pointer border border-accent"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <FiMenu size={20} />
            </button>
        )}

        {/* Overlay for mobile */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 z-40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
            ></div>
        )}
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-50 h-full md:h-auto bg-primary text-white flex flex-col transform transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            w-64 md:static md:translate-x-0
            ${isSidebarOpen ? "md:w-64" : "md:w-16"}`}> 

            {/* Header Section */}
            <div className="p-4 flex items-center gap-2">
                <button
                    className="text-white hover:bg-accent p-2 rounded-lg cursor-pointer border border-accent"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <FiMenu size={20} />
                </button>
                {isSidebarOpen && (
                    <h1 className="text-2xl font-bold text-white ml-2">
                        Menu
                    </h1>
                )}
            </div>
    
            {/* User Profile pic */}
            <div
                className={`flex justify-center gap-3 ${isSidebarOpen ? "p-4" : "p-2"}`}
            >
                <label className="cursor-pointer relative group">
                    <img
                        src={user?.profilePic || defaultProfilePic}
                        alt=""
                        className={`${isSidebarOpen ? "w-40 h-40" : "w-10 h-10"} rounded-full`}
                    />
                    <div className="absolute inset-0 text-md flex items-center justify-center group-hover:opacity-100 opacity-0 bg-black/50 rounded-full transition-opacity duration-300 ease-in-out">
                        <FiEdit size={20} />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange}/>
                </label>
            </div>
            <div className={`${isSidebarOpen ? "block" : "hidden"}`}>
                <h2 className="font-bold text-white text-center">
                    {user?.name}
                </h2>
                <p className="text-sm text-gray-300 text-center">
                    {user?.email}
                </p>
            </div>
    
            {/* Navigation Links */}
            <nav className="flex-1 px-2 py-4 space-y-2">
                <button
                    className="w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {navigate("/dashboard/profile")}}
                >
                    <FaHome size={20} />
                    {isSidebarOpen && <span>Patient Dashboard</span>}
                </button>
                <button
                    className="w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={handleLogout}
                >
                    <FiLogOut size={20} />
                    {isSidebarOpen && <span>Logout</span>}
                </button>
            </nav>
        </aside>
    </>
  )
}

export default Sidebar