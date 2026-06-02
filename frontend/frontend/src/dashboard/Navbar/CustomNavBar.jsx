import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/employees")) return "Employee Management";
    if (pathname.startsWith("/tasks")) return "Tasks Management";
    if (pathname.startsWith("/payroll")) return "Financial Management";
    if (pathname.startsWith("/budgeting")) return "Financial Management";
    if (pathname.startsWith("/invoice")) return "Financial Management";
    if (pathname.startsWith("/payslip")) return "Financial Management";
    if (pathname.startsWith("/income-expenses")) return "Financial Management";
  return "";
};

function CustomNavbar({ sidebarOpen, setSidebarOpen }) {
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
    
    fetch("http://localhost:8081/api/users/me", {
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

      {pageTitle && <div className="navbar-brand">{pageTitle}</div>}
      {/* Left side */}
      <div className="nav-left">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <i className="bi bi-list"></i>
        </div>

        <div className={`back-arrow ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)}>
          <i className="bi bi-chevron-left"></i>
        </div>
      </div>

      {/* Right side */}
      <div className="nav-right">

        


      </div>

    </nav>
  );
}

export default CustomNavbar;