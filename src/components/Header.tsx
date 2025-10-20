import React from "react";
import { NavLink } from "react-router-dom";
import logoImage from "/public/logo.png";

const Header: React.FC = () => {
    return (
        <header className="header">
            <nav className="container">
                <NavLink to="/" className="logo">
                    <img src={logoImage} alt="Proyak Logo" />
                </NavLink>
                <ul className="nav-links">
                    <li>
                        <NavLink to="/features">Features</NavLink>
                    </li>
                    <li>
                        <NavLink to="/how-it-works">How It Works</NavLink>
                    </li>
                    <li>
                        <NavLink to="/employer">Employer Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/candidates">Candidates</NavLink>
                    </li>
                </ul>
                <NavLink to="/" className="cta-button">
                    Home
                </NavLink>
            </nav>
        </header>
    );
};

export default Header;
