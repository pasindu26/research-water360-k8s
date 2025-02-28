import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Social media icons
import { Link } from 'react-router-dom';
import '../Footer.css'; // Import the CSS file

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Social Media Icons */}
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
            <FaLinkedin />
          </a>
        </div>

        {/* Links Section */}
        <div className="footer-links">
          <Link to="/pricing" className="footer-link">Pricing</Link>
          <Link to="/faqs" className="footer-link">FAQs</Link>
          <Link to="/about" className="footer-link">About</Link>
        </div>

        {/* Copyright Section */}
        <p className="footer-text">
          <a href="https://dtk2globle.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            © 2024 dtk2globle.com
          </a>
          &nbsp;All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
