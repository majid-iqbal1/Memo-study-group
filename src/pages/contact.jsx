import React, { useState } from 'react';
import NavLayout from '../components/NavLayout';
import { Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({ name: '', email: '', message: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <NavLayout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
                    <p className="text-gray-600">
                        Have questions? We'd love to hear from you. Send us a message
                        and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label 
                                htmlFor="name" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label 
                                htmlFor="message" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="6"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
                                placeholder="What would you like to say?"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Send size={20} />
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Optional: Add contact information section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Email</h3>
                        <p className="text-gray-600">support@memo-plus.com</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Phone</h3>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Location</h3>
                        <p className="text-gray-600">Seattle, WA 98105</p>
                    </div>
                </div>
            </div>
        </NavLayout>
    );
};

export default Contact;