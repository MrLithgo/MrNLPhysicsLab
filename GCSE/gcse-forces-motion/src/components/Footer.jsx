// components/Navbar.jsx
import { useState } from 'react';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="nav">
            <div className="nav-container">
                <div className="nav-flex">
                    <div className="nav-items">
                        <a href="/" className="nav-logo">
                            <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                {/* Your logo SVG */}
                            </svg>
                            <span className="logo-text">Physics Sims</span>
                        </a>
                    </div>

                    <div className="nav-menu">
                        <a href="/" className="nav-link active">Home</a>
                        <a href="/about" className="nav-link">About</a>
                        {/* Other nav links */}
                    </div>

                    <div className="mobile-menu-btn">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                {/* Menu icon SVG */}
                            </svg>
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-menu-content">
                            <a href="/" className="mobile-nav-link">Home</a>
                            <a href="/about" className="mobile-nav-link">About</a>
                            {/* Other mobile nav links */}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;