import React from 'react';
import { Link } from 'react-router-dom';
import { VideoCameraIcon, UploadIcon, DocumentIcon } from '../components/Icons';

const HomePage = () => {
    return (
        <div className="bg-gray-50 text-gray-800">
            <nav className="bg-white shadow-md fixed w-full z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">VidyaConnect</h1>
                    <div>
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold mr-4">Login</Link>
                        <Link to="/register" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Sign Up</Link>
                    </div>
                </div>
            </nav>
            <header className="pt-32 pb-16 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Resilient Education for a Connected India.</h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">VidyaConnect is a virtual classroom designed to work on low-bandwidth networks, ensuring learning never stops.</p>
                    <div className="mt-8">
                        <Link to="/register" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700">Get Started</Link>
                    </div>
                </div>
            </header>
        </div>
    );
};
export default HomePage;

