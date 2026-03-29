import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import bgImage from '../assets/background/MediConnect-Reception-background.png'
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from "react-icons/fi"
import API from '../api/axios';

const Register = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: ""
	});
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false)

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value
		})
	}

	const handleRegister = async (e) => {
		e.preventDefault();

		if(formData.password !== formData.confirmPassword){
			setError("Passwords do not match");
			return;
		}

		setError("");

		try{
			setLoading(true);

			await API.post("/auth/register", {
				name: formData.name,
				email: formData.email,
				password: formData.password
			})

			setLoading(false);
			toast.success("Registration successful");
			navigate("/login");
		}catch(error){
			setError(error.response?.data?.message || "Registration failed");
			console.log(error);
			setLoading(false);
		}
	}

  return (
    <div className='flex items-center justify-center bg-background px-4 py-10 h-[calc(100vh-5rem)] bg-cover bg-center' style={{ backgroundImage: `url(${bgImage})` }}>

        <div className='bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md'>
			{/* Title */}
            <h2 className='text-2xl font-bold mb-6 text-primary text-center'>Register</h2>

			{/* Form */}
            <form className='flex flex-col gap-4' onSubmit={handleRegister}>
				{/* Error */}
				{error && <p className='text-red-500 text-center'>{error}</p>}
				{/* Name */}
                <div>
                    <label className='block text-gray-700 mb-2' htmlFor='name'>Name</label>
                    <input className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent' type='text' id='name' placeholder='Enter your name' autoComplete='off' value={formData.name} onChange={handleChange} required/>
                </div>
				{/* Email */}
                <div>
                    <label className='block text-gray-700 mb-2' htmlFor='email'>Email</label>
                    <input className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent' type='email' id='email' placeholder='Enter your email' autoComplete='off' value={formData.email} onChange={handleChange} required/>
                </div>
				{/* Password */}
                <div className='relative'>
                    <label className='block text-gray-700 mb-2' htmlFor='password'>Password</label>
                    <input className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent' type={showPassword ? "text" : "password"} id='password' autoComplete='new-password' placeholder='Enter your password' value={formData.password} onChange={handleChange} required/>
					<span onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-13 transform -translate-y-1/2 cursor-pointer'>
						{showPassword ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
					</span>
                </div>
				{/* Confirm Password */}
				<div className='relative'>
					<label className='block text-gray-700 mb-2' htmlFor='confirmPassword'>Confirm Password</label>
					<input className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent' type={showConfirmPassword ? "text" : "password"} id='confirmPassword' autoComplete='off' placeholder='Confirm your password' value={formData.confirmPassword} onChange={handleChange} required/>
					<span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-3 top-13 transform -translate-y-1/2 cursor-pointer'>
						{showConfirmPassword ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
					</span>
				</div>
                <button className={`py-2 rounded-lg font-medium transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-accent text-white"} cursor-pointer`} type='submit' disabled={loading}>{loading ? "Registering..." : "Register"}</button>
            </form>
			{/* Footer */}
			<p className='text-center text-gray-600 mt-4'>
				Already have an account?{" "}
				<Link to="/login" className='text-accent hover:underline'>Login</Link>
			</p>
        </div>
    </div>
  )
}

export default Register