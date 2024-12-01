import React from 'react';
import '../styles/about.css';
import NavLayout from '../components/NavLayout';
 import bruceImage from '../assets/bruceImage.jpeg';
//import ethanImage from '../assets/ethan.jpg'; 
import sulavImage from '../assets/sulavImage.jpeg'; 
import majidImage from '../assets/majidImage.jpg';

const About = () => {
    return (
        <NavLayout>
        <div className="about-page">
            <h1>About Us</h1>
            <div className="profile-section">
                <div className="profile">
                    <div className="profile-image-container">
                        <img src={bruceImage} alt="Bruce Duong" className="profile-image" />
                    </div>
                    <div className="profile-content">
                        <h2>Bruce Duong</h2>
                        <p>Senior college student majoring in computer science. Active ping pong player and rock climber. Experienced with C++ and ARM.</p>
                    </div>
                </div>
                
                <div className="profile">
                    <div className="profile-image-container">
                        <img src={" "}alt="Ethan Humrich" className="profile-image" />
                    </div>
                    <div className="profile-content">
                        <h2>Ethan Humrich</h2>
                        <p>Senior in Computer Science and Software Engineering. Experienced with C++, C#, C, Python, HTML, CSS, JavaScript, and ASM.</p>
                    </div>
                </div>
                
                <div className="profile">
                    <div className="profile-image-container">
                        <img src={sulavImage} alt="Sulav Shakya" className="profile-image" />
                    </div>
                    <div className="profile-content">
                        <h2>Sulav Shakya</h2>
                        <p>Junior in Computer Science with experience in C++, Python, Java, JavaScript, HTML, CSS, SQL. Developed apps with Discord and Spotify APIs.</p>
                    </div>
                </div>
                
                <div className="profile">
                    <div className="profile-image-container">
                    <img src={majidImage} alt="Majid Iqbal" className="profile-image" />
                    </div>
                    <div className="profile-content">
                        <h2>Majid Iqbal</h2>
                        <p>Senior in Computer Science and Software Engineering. Experienced in C++, Python, HTML, CSS, JavaScript, ARM, & SQL.</p>
                    </div>
                </div>
            </div>
        </div>
        </NavLayout>
    );
};

export default About;