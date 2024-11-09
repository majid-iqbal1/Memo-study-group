import React from 'react';
import '../styles/contact.css';
import NavLayout from '../components/NavLayout';

const Contact = () => {
    return (
        <NavLayout>
        <div className="contact-page">
            <h1>Contact Us</h1>
            <form className="contact-form">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" required />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label htmlFor="message">Message:</label>
                <textarea id="message" name="message" rows="4" required></textarea>

                <button type="submit">Send Message</button>
            </form>
        </div>
      </NavLayout>
    );
};

export default Contact;