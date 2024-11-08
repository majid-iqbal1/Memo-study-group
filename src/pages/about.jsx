import React from 'react';
import '../styles/about.css';
import '../styles/basic-page.css';

const About = () => {
    return (
        <div className="About-page">
            <h1>About Us</h1>
            <p>Profile: </p>
            <p>Bruce Duong: Senior college student majoring in computer science. Active ping pong player and rock climber. Experienced with C++ and ARM. </p>
            <p>Ethan Humrich: A senior college student majoring in Computer Science and Software Engineering. Some experience with StreamLit and hosting a website using GitHub pages. Experienced with C++, C#, C, Python, HT	L, CSS, JavaScript, and ASM in that order. Giggler </p>
            <p>Sulav Shakya: Junior college student majoring in Computer Science. Experience with C++, Python, Java, JavaScript, HTML,CSS, SQL. Have developed apps utilizing both Discord’s and Spotify’s API within a python code-base. </p>
            <p>Majid Iqbal: A senior student majoring in computer science and software engineering. Experienced in C++, python, HTML, CSS, Javascript, ARM, & SQL. </p>
            {/* Add your About-specific content here */}
        </div>
    );
};

export default About;