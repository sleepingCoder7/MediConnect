import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import bgImage from '../assets/background/MediConnect-Reception-background.png'
import API from '../api/axios';
import defaultImage from '../assets/departmentImages/default-doctor.jpg';
import { toast } from "react-hot-toast";

const MyAppointment = () => {
  	const [appointments, setAppointments] = useState([]);
  	const [yearFilter, setYearFilter] = useState("");

  	useEffect(() => {
    	fetchAppointments(yearFilter);
  	}, [yearFilter]);

  	const fetchAppointments = async (year) => {
    	const url = year ? `/appointments?year=${year}` : "/appointments";
    	const response = await API.get(url);
    	setAppointments(response.data.data);
  	};

	const convertTo12hr = (time) => {
		const [hours, minutes] = time.split(":");
		const ampm = hours >= 12 ? "PM" : "AM";
		const hours12 = hours % 12 || 12;
		return `${hours12}:${minutes} ${ampm}`;
	};

    const handleCancelAppointment = async (id) => {
		toast.loading("Canceling appointment...", { id: "cancelAppt" });
		try {
			await API.delete(`/appointments/${id}`);
			setAppointments(appointments.filter((app) => app._id !== id));
			toast.success("Appointment canceled successfully", { id: "cancelAppt" });
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to cancel appointment", { id: "cancelAppt" });
		}
	};

  	return (
    	<div className="flex bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      		<aside className='flex min-h-screen'>
        		<Sidebar />
      		</aside>
      		<main className='flex p-6 w-full flex-col'>
        		<div className='bg-white p-6 rounded shadow-md w-full flex flex-col md:flex-row justify-between h-fit md:mt-4 border-2 border-gray-200'>
          			<h2 className='text-xl font-semibold text-primary mb-6 md:mb-0 text-center'>My Appointments</h2>
          			<div className='flex items-center gap-2 justify-center'>
            			<label htmlFor="year">Filter By</label>
            			<select 
                            name="year" 
                            id="year" 
                            className='border border-gray-300 rounded-lg p-2 max-w-20'
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                        >
              				<option value="">Year</option>
              				<option value="2026">2026</option>
              				<option value="2027">2027</option>
              				<option value="2028">2028</option>
            			</select>
						<button 
                            className='bg-gray-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-500 transition-colors duration-300'
                            onClick={() => setYearFilter("")}
                        >
                            Clear Filter
                        </button>
         			</div>
        		</div>

        		{/* Cards */}
        		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6'>
          			{appointments.length === 0 ? (
						<p className='flex items-center justify-center text-2xl col-span-full text-white bg-black/40 rounded-lg p-6'>No appointments found</p>
					) : (
						appointments.map((appointment) => (
						<div key={appointment._id} className='bg-white p-6 rounded shadow-md w-full flex flex-col h-full'>
							<img src={appointment.departmentId?.image || defaultImage} alt="doctor" className="w-full h-64 object-center rounded-md mb-4" />
							<div className="grow">
                                <p><strong>Department:</strong> {appointment.departmentId?.name}</p>
                                <p><strong>Date:</strong> {appointment.appointmentDate?.toString().slice(0, 10)}</p>
								<p><strong>Time:</strong> {convertTo12hr(appointment.appointmentDate?.toString().slice(11, 16))}</p>
								<p><strong>Comments:</strong> {appointment.comments}</p>

								{/* Reports */}
								<p><strong>Reports:</strong></p>
								{appointment.reports.length > 0 ? (
									appointment.reports.map((report) => (
										<a className='text-blue-500 underline break-all' key={report._id} href={report.url} target="_blank" rel="noreferrer">{report.public_id?.split("/")?.pop() || 'View Report'}</a>
									))
								) : (
									<p>No reports found</p>
								)}
							</div>
							
							<div className='flex justify-center'>
                            <button 
                                className='mt-4 bg-gray-500 hover:bg-red-500 text-white py-2 px-4 rounded transition-colors duration-300 cursor-pointer'
                                onClick={() => handleCancelAppointment(appointment._id)}
                            >
                                Cancel Appointment
                            </button>
							</div>
						</div>
          				))
					)}
        		</div>
      		</main>
    	</div>
  	)
}

export default MyAppointment