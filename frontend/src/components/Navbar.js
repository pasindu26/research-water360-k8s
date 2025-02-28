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
                href="#"
                className="brand-custom"
                style={{ marginLeft: '15px', paddingRight: '20px' }}
            >
                Water360 Dashboard
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    {auth.loggedIn && (
                        <>
                            <Nav.Link as={NavLink} to="/" end>
                                Home
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/DataTable" end>
                                Live Update
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/graphs" end>
                                Graph
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/compare-graphs" end>
                                Compare Graphs
                            </Nav.Link>
                            {auth.user?.user_type === 'admin' && (
                                <Nav.Link as={NavLink} to="/admin" end>
                                    Admin
                                </Nav.Link>
                            )}
                        </>
                    )}
                </Nav>
                <Nav className="ms-auto">
                    {/* Theme Toggle */}
                    <Nav.Link onClick={toggleTheme} className="theme-toggle">
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
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <>
                            <Nav.Link as={NavLink} to="/login" end>
                                Login
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/signup" end>
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
