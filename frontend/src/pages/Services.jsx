import React, { useEffect, useState } from "react";
import API from "../api/axios";
import bgImage from "../assets/background/MediConnect-Building-background.png";

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get("/services");
        setServices(res.data);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Services</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service._id}
            className="bg-gray-300 h-40 flex items-center justify-center text-center text-lg font-medium rounded-md"
          >
            {service.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;