import React from "react";
import { NavLink } from "react-router-dom";
import logoImage from "../assets/logo.png";
import AuthSection from "./AuthSection";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
    const { user } = useAuth();
    const userType = user?.user_metadata?.user_type;

    return (
        <header className="header">
            <nav className="container">
                <NavLink to="/" className="logo">
                    <img src={logoImage} alt="Proyak Logo" />
                </NavLink>
                
                <ul className="nav-links">
                    {/* Show different navigation based on login status and user type */}
                    {!user ? (
                        // Not logged in - show marketing pages
                        <>
                        <li> <NavLink to="/">Home</NavLink></li>

                            <li>
                                <NavLink to="/register">Get Started</NavLink>
                            </li>
                        </>
                    ) : userType === 'individual' ? (
                        // Individual user - show job browsing and applications
                        <>
                            <li>
                                <NavLink to="/jobs">Browse Jobs</NavLink>
                            </li>
                            <li>
                                <NavLink to="/individual-dashboard">My Applications</NavLink>
                            </li>
                        </>
                    ) : (userType === 'business' || userType === 'recruiter') ? (
                        // Business or Recruiter - show hiring tools
                        <>
                            <li>
                                <NavLink to={
                                    userType === 'business' 
                                        ? '/business-dashboard' 
                                        : '/recruiter-dashboard'
                                }>
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/post-job">Post Job</NavLink>
                            </li>
                            <li>
                                <NavLink to="/candidates">Candidates</NavLink>
                            </li>
                        </>
                    ) : null}
                    
                    {/* Keep testing link for development */}
                    <li>
                        <NavLink to="/testing">Vector Testing</NavLink>
                    </li>
                </ul>
                
                <AuthSection />
            </nav>
        </header>
    );
};

export default Header;