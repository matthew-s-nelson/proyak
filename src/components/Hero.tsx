import React, { useState, useEffect } from "react";
import logoImage from "/public/logo.png";

const Hero: React.FC = () => {
    const [formLoaded, setFormLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFormLoaded(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="hero" id="validate">
            <div className="container">
                <h1>
                    <img src={logoImage} alt="Proyak Logo" />
                    <span
                        style={{
                            marginTop: "30px",
                            display: "inline-block",
                            verticalAlign: "top",
                        }}
                    >
                        is Coming Soon
                    </span>
                </h1>
                <p>
                    We're building the first job board that's completely free
                    for job seekers and uses verified credentials to create
                    perfect matches. Help us validate our concept and stay
                    updated on our progress.
                </p>

                <div
                    className="signup-form-header"
                    id="heroValidateHeader"
                ></div>

                {/* Embedded survey moved into hero so the headline and survey appear together */}
                <div className="embedded-form-container" id="heroSurvey">
                    {!formLoaded && (
                        <div className="loading-message" id="loadingMessage">
                            <div className="loading-spinner"></div>
                            Loading signup form...
                        </div>
                    )}
                    <div
                        className="embedded-form-wrapper"
                        style={{ display: formLoaded ? "block" : "none" }}
                        id="formWrapper"
                    >
                        <iframe
                            className="embedded-google-form"
                            src="https://docs.google.com/forms/d/e/1FAIpQLSfwtxVQ8UH3nJFrX23J0AYNNxtdLVrESjfhxijIil4UQwDjEg/viewform?embedded=true"
                            frameBorder="0"
                            title="Proyak Signup Form"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
