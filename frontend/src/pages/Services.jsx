import React, { useEffect, useState } from "react";
import API from "../api/axios";
import bgImage from "../assets/background/MediConnect-Building-background.png";
import ServiceCard from "../components/ServiceCard";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await API.get("/services");
        setServices(res.data?.services);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Services</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.length > 0 && services.map((service) => (
            <ServiceCard key={service._id} title={service.name} description={service.description} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;