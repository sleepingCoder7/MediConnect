import React from 'react'
import { Link } from 'react-router'
import logo from "../assets/logo/logo-wide.png";
import logo2x from "../assets/logo/logo-wide@2x.png";

const Footer = () => {
    return (
        <footer className="bg-primary text-white p-6 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div>
                    <img src={logo} srcSet={`${logo} 1x, ${logo2x} 2x`} alt="MediConnect" className="h-12 object-contain" />
                    <p className='mt-4 text-sm text-white/80'>Connecting patients with healthcare services seamlessly and efficiently.</p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className='font-semibold mb-2'>Quick Links</h3>
                    <div className='flex flex-col gap-1 text-sm text-white/80'>
                        <Link to="/" className='hover:text-accent transition-colors'>Home</Link>
                        <Link to="/services" className='hover:text-accent transition-colors'>Services</Link>
                        <Link to="/book-appointment" className='hover:text-accent transition-colors'>Book Appointment</Link>
                    </div>
                </div>

                {/* Contact us */}
                <div>
                    <h3 className='font-semibold mb-2'>Contact Us</h3>
                    <div className='flex flex-col gap-1 text-sm text-white/80'>
                        <p>📧 <a href="mailto:support@mediconnect.com" className="hover:underline">support@mediconnect.com</a></p>
                        <p>📞 <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a></p>
                    </div>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="font-semibold mb-2">Stay Updated</h3>
                    <p className='text-sm text-white/80 mb-2'>Get the latest health news and updates</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter email"
                            className="px-3 py-2 rounded-lg w-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button className="bg-red-400 px-4 py-2 text-white rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            Subscribe
                        </button>
                    </div>
                </div>


            </div>

            <div className="border-t border-white/10 mt-6 pt-4 text-center text-sm text-white/80">
                <p>&copy; {new Date().getFullYear()} MediConnect. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer