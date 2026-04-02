import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { FiCalendar, FiPhone, FiFile, FiUpload, FiMessageSquare } from 'react-icons/fi';
import { FcDepartment } from 'react-icons/fc';
import bgImage from '../assets/background/MediConnect-Reception-background.png';
import { toast } from "react-hot-toast";
import API from '../api/axios';
import { useNavigate } from "react-router";

const BookAppointment = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({
        date: '',
        department: '',
        phone: user?.profile?.phone || '',
        comments: '',
        reports: []
    });
    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer";
    const [departments, setDepartments] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDepartments();
        fetchUser();
    }, []);

    const fetchDepartments = async () => {
        const response = await API.get("/departments");
        setDepartments(response.data.departments);
    };

    const fetchUser = async () => {
        const response = await API.get("/auth/me");
        console.log(response.data.user);
        setFormValues({...formValues, phone: response.data.user?.profile?.phone || ""});
    };

    const handleChange = (e) => {
        setFormValues({...formValues, [e.target.name]: e.target.value});
    }

    const getMinDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 2); // 2 hours from now
        // Convert to local time string expected by datetime-local (YYYY-MM-DDThh:mm)
        const tzOffset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    const handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const hours = selectedDate.getHours();
        const mins = selectedDate.getMinutes();

        // 9 AM to 9 PM (21:00) window
        if (hours < 9 || hours > 21 || (hours === 21 && mins > 0)) {
            toast.error("Appointments can only be booked between 9 AM and 9 PM", {id: "InvalidTimeslot"});
            return; // Do not update state, discarding the invalid input
        }

        setFormValues({...formValues, date: e.target.value});
    };

    const handlePhoneChange = (e) => {
        setFormValues({...formValues, phone: e.target.value});
        const value = e.target.value;
        if (!/^[0-9]*$/.test(value)) {
            setErrors((prev) => ({...prev, "phone": "Phone number must contain only numbers"}));
            return;
        }
        if (value.length < 10) {
            setErrors((prev) => ({...prev, "phone": "Phone number must be at least 10 digits"}));
            return;
        }
        const {phone, ...remainingErrors} = errors;
        setErrors(remainingErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(Object.keys(errors).length > 0){
            toast.error("Please fix the errors before submitting", {id: "bookAppointment"});
            return;
        }
        toast.loading("Booking appointment...", {id: "bookAppointment"});
        
        try{
            const form = new FormData();
            form.append("date", formValues.date);
            form.append("departmentId", formValues.department);
            form.append("phone", formValues.phone);
            form.append("comments", formValues.comments);
            
            formValues.reports.forEach((file) => {
                form.append("reports", file);
            });

            const response = await API.post("/appointments", form);
            toast.success("Appointment booked successfully", {id: "bookAppointment"});
            navigate("/my-appointment");
        }catch(error){
            toast.error("Failed to book appointment", {id: "bookAppointment"});
        }
    }

    const handleFileChange = (e) => {
        setFormValues({...formValues, reports: Array.from(e.target.files)});
    };

    return (
        <div className='flex bg-cover bg-center' style={{backgroundImage: `url(${bgImage})`}}>
        <aside className="flex min-h-screen">
            <Sidebar />
        </aside>
        <main className='flex justify-center p-6 w-full'>
            <form className='bg-white p-6 rounded shadow-md w-full md:w-[480px] flex flex-col h-fit md:mt-10' onSubmit={handleSubmit}>
                <h2 className='text-xl font-semibold text-primary text-center mb-6'>Book an Appointment</h2>
                <div className='flex items-center gap-2 mt-2'>
                    <FiCalendar size={16} color='#007bff' />
                    <label htmlFor="date">Select Date and time</label>
                </div>
                <input type="datetime-local" id="date" name="date" required min={getMinDateTime()} value={formValues.date} onChange={handleDateChange} className={inputClass} />

                <div className='flex items-center gap-2 mt-4'>
                    <FcDepartment size={16} color='#007bff' />
                    <label htmlFor="department">Select Department</label>
                </div>
                <select id="department" name="department" required value={formValues.department} onChange={handleChange} className={inputClass}>
                    <option value="">Department</option>
                    {departments.length > 0 && departments.map((department) => (
                        <option key={department._id} value={department._id}>{department.name}</option>
                    ))}
                </select>

                <div className='flex items-center gap-2 mt-4'>
                    <FiPhone size={16} color='#007bff' />
                    <label htmlFor="phone">Phone Number</label>
                </div>
                <input type="text" id="phone" name="phone" minLength={10} maxLength={10} placeholder="Enter your phone number" required value={formValues.phone} onChange={handlePhoneChange} className={inputClass}/>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

                <div className='flex items-center gap-2 mt-4'>
                    <FiMessageSquare size={16} color='#007bff' />
                    <label htmlFor="comments">Comments</label>
                </div>
                <textarea id="comments" name="comments" placeholder="Explain your symptoms" rows="4" value={formValues.comments} onChange={handleChange} className={inputClass}></textarea>

                <div className='flex items-center gap-2 mt-4'>
                    <FiUpload size={16} color='#007bff' />
                    <label htmlFor="reports">Upload Reports</label>
                </div>
                <input className={inputClass} type="file" accept=".pdf,.jpg,.jpeg,.png" id="reports" name="reports" multiple onChange={handleFileChange} />

                <button type="submit" className="text-center bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg cursor-pointer mt-4">Submit</button>
            </form>
        </main>
        </div>
    )
}

export default BookAppointment