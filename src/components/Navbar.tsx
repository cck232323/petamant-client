import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../api/authService';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Petamant</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/activities">Activities</Link>
            </li>
            {isAuthenticated && (
              <>
                {/* <li className="nav-item">
                  <Link className="nav-link" to="/my-activities">My Activities</Link>
                </li> */}
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle" 
                  href="#" 
                  id="navbarDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  My Account
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/my-activities">My Activities</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </li>
            ) : (
              <>
                {/* <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li> */}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;