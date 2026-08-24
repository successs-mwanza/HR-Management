import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


const getPageTitle = (pathname) => {
  if (pathname.startsWith("/employees")) return "Employee Management";
  return "";
};

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Option 1: get from localStorage
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }

    // Option 2 (better): fetch from backend
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8081/api'}/users/me`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(data => setUsername(data.name))
      .catch(err => console.error(err));
    
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">

      {/* Left side */}
      <div className="nav-left">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <i className="bi bi-list"></i>
        </div>

        <div className={`back-arrow ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)}>
          <i className="bi bi-chevron-left"></i>
        </div>

        {pageTitle && <div className="module-title">{pageTitle}</div>}
      </div>

      {/* Right side */}
      <div className="nav-right">

        <i className="bi bi-bell"></i>


      </div>

    </nav>
  );
}

export default Navbar;