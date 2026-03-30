import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import bgImage from '../assets/background/MediConnect-Building-background.png'
import { FiEye, FiEyeOff } from "react-icons/fi"
import API from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: ""
	});
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const {setUser} = useAuth();

	
	const handleLogin = async (e) => {
		e.preventDefault();

		//Basic Validation
		if(!formData.email || !formData.password ){
			setError("All fields are required");
			return;
		}
		setError("");

		try{
			setLoading(true);

			const response = await API.post("/auth/login", {
				email: formData.email,
				password: formData.password
			})

			setLoading(false);
			toast.success("Login successful");
			setUser(response.data.user);
			navigate("/dashboard");
		}catch(error){
			setLoading(false);
			console.log(error);
			setError(error.response?.data?.message || "Login failed");
		}
	}

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value
		})
	}

    return (
    <div 
      className='flex items-center justify-center px-4 py-10 h-screen bg-cover bg-center'
      style={{ backgroundImage: `url(${bgImage})` }}
    >

        <div className='p-8 rounded-2xl shadow-lg w-full max-w-md bg-white/80 backdrop-blur-md'>
			{/* Title */}
            <h2 className='text-2xl font-bold mb-6 text-primary text-center'>Login</h2>

			{/* Form */}
            <form onSubmit={handleLogin} className='flex flex-col gap-4'>
				{/* Error */}
				{error && <p className='text-red-500 text-center'>{error}</p>}
				{/* Email */}
                <div>
                    <label className='block text-gray-700 mb-2' htmlFor='email'>Email</label>
                    <input className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent' type='email' id='email' autoComplete='e-mail' placeholder='Enter your email' value={formData.email} onChange={handleChange}/>
                </div>
				{/* Password */}
                <div className='relative'>
                    <label className='block text-gray-700 mb-2' htmlFor='password'>Password</label>
                    <input className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent' type={showPassword ? "text" : "password"} id='password' autoComplete='current-password' placeholder='Enter your password' value={formData.password} onChange={handleChange}/>
					<span onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-13 transform -translate-y-1/2 cursor-pointer'>
						{showPassword ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
					</span>
                </div>
                <button className={`w-full py-2 rounded-lg font-medium transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-accent text-white"} cursor-pointer`} type='submit' disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
				<div className='flex items-center justify-center'>
					<div className='w-full border-t border-gray-300'></div>
					<span className='px-4 text-gray-500'>or</span>
					<div className='w-full border-t border-gray-300'></div>
				</div>

				{/* Google Login */}
				<div className='flex items-center justify-center'>
					<button type="button">
						<GoogleLogin
							onSuccess={async (credentialResponse) => {
								try{
									toast.loading("Logging in...", {id: "login"});
									const res = await API.post("/auth/google", {
										token: credentialResponse.credential
									});

									setUser(res.data.user);
									toast.success("Login successful", {id: "login"});
									navigate("/dashboard");
			
								}catch(error){
									console.log(error);
									toast.error("Login failed", {id: "login"});
								}
							}}
							onError={() => {
									console.log('Google Login Failed');
							}}
						/>
					</button>
				</div>
            </form>

			{/* Footer */}
			<p className='text-center text-gray-600 mt-4'>
				Don't have an account?{" "}
				<Link to="/register" className='text-accent hover:underline'>Register</Link>
			</p>
        </div>
    </div>
  )
}

export default Login