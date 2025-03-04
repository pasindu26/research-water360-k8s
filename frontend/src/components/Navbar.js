import React, { useContext } from 'react';
import { Navbar, Nav, NavDropdown, Image } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import '../Navbar.css';

function AppNavbar() {
    const { auth, clearUser } = useContext(AuthContext);
    const { toggleTheme, theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        clearUser();
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="navbar-custom">
            <Navbar.Brand
                as={NavLink}
                to={auth.loggedIn ? "/" : "/about"}
                className="brand-custom d-flex align-items-center"
                style={{ marginLeft: '15px', paddingRight: '20px' }}
            >
                <Image
                    src="/logo.png"
                    alt="Water360 Logo"
                    height="40"
                    className="d-inline-block align-top me-2"
                />
                Water360
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    {auth.loggedIn ? (
                        // Navigation items for logged-in users
                        <>
                            <Nav.Link as={NavLink} to="/" end className="nav-link-animated">
                                Dashboard
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/DataTable" end className="nav-link-animated">
                                Live Update
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/graphs" end className="nav-link-animated">
                                Graph
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/compare-graphs" end className="nav-link-animated">
                                Compare Graphs
                            </Nav.Link>
                            {auth.user?.user_type === 'admin' && (
                                <Nav.Link as={NavLink} to="/admin" end className="nav-link-animated">
                                    Admin
                                </Nav.Link>
                            )}
                        </>
                    ) : (
                        // Navigation items for non-logged-in users
                        <>
                            <Nav.Link as={NavLink} to="/about" end className="nav-link-animated">
                                About
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/pricing" end className="nav-link-animated">
                                Pricing
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/faqs" end className="nav-link-animated">
                                FAQs
                            </Nav.Link>
                        </>
                    )}
                </Nav>
                <Nav className="ms-auto">
                    {/* Theme Toggle */}
                    <Nav.Link onClick={toggleTheme} className="theme-toggle nav-link-animated">
                        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </Nav.Link>
                    {auth.loggedIn ? (
                        <NavDropdown
                            title={
                                <span>
                                    <Image
                                        src="https://img.icons8.com/?size=100&id=20749&format=png&color=000000"
                                        roundedCircle
                                        style={{ marginRight: '8px', width: '30px', height: '30px' }}
                                    />
                                    {auth.user?.firstname || 'Profile'}
                                </span>
                            }
                            id="basic-nav-dropdown"
                            className="ml-auto"
                            align="end"
                            style={{ marginRight: '15px' }}
                        >
                            <NavDropdown.Item onClick={handleLogout} className="nav-link-animated">Logout</NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <>
                            <Nav.Link as={NavLink} to="/login" end className="nav-link-animated">
                                Login
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/signup" end className="nav-link-animated">
                                Signup
                            </Nav.Link>
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default AppNavbar;
