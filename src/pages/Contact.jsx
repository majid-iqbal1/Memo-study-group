/******************************************************************************
 *                           Contact Page Component                           *
 ******************************************************************************/

/*************************** Component Information ****************************
 *                                                                            *
 *  Purpose: Contact form for user inquiries and feedback                     *
 *  Version: 1.2.0                                                            *
 *  Created: November 2024                                                    *
 *  Updated: December 2024                                                    *
 *  Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich            *
 *                                                                            *
 *****************************************************************************/

/******************************** Features ************************************
 *                                                                            *
 *  FORM FEATURES              |   FUNCTIONALITY                              *
 *  -------------------------  |   --------------------------------------     *
 *  - Name input               |   - Email validation                         *
 *  - Email input              |   - Form submission handling                 *
 *  - Message textarea         |   - Success confirmation                     *
 *  - Submit button            |   - Loading state management                 *
 *                                                                            *
 *****************************************************************************/

/****************************** Dependencies **********************************
 *                                                                            *
 *  REACT IMPORTS              |   EXTERNAL LIBRARIES                         *
 *  -------------------------  |   --------------------------------------     *
 *  - useState                 |   - emailjs/browser                          *
 *  - useRef                   |   - lucide-react icons                       *
 *                             |                                              *
 *  COMPONENTS                 |   STYLES                                     *
 *  -------------------------  |   --------------------------------------     *
 *  - NavLayout                |   - contact.css                              *
 *                                                                            *
 *****************************************************************************/

import React, { useState, useRef } from 'react';
import NavLayout from '../components/NavLayout';
import { Send, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import '../styles/contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const form = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await emailjs.sendForm(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                form.current,
                process.env.REACT_APP_EMAILJS_PUBLIC_KEY
            );

            setShowConfirmation(true);
            setFormData({ name: '', email: '', message: '' });
            
            setTimeout(() => {
                setShowConfirmation(false);
            }, 3000);

        } catch (error) {
            console.error('Failed to send email:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
            <div className="contact-container">
                <div className="contact-header">
                    <h1>Contact Us</h1>
                    <p>
                        Have questions? We'd love to hear from you. Send us a message
                        and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="contact-form-container">
                    <form ref={form} onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="What would you like to say?"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </button>

                        {showConfirmation && (
                            <div className="confirmation-message">
                                <CheckCircle size={24} color="#4CAF50" />
                                <span>Message sent successfully!</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </NavLayout>
    );
};

export default Contact;
