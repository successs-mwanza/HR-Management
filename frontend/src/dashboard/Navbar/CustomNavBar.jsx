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
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }

    // Fetch from backend
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8081/api/users/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch user");
        })
        .then(data => {
          if (data.name) {
            setUsername(data.name);
            localStorage.setItem("username", data.name);
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <nav className="CustomNavbar">
      {/* Left side */}
      <div className="nav-left">
        <div className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <i className="bi bi-list"></i>
        </div>

        <div className={`back-arrow ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)}>
          <i className="bi bi-chevron-left"></i>
        </div>

        {pageTitle && <div className="navbar-brand">{pageTitle}</div>}
      </div>

      {/* Right side */}
      <div className="nav-right">
        {username && (
          <>
            <i className="bi bi-person-circle"></i>
            <span className="username">{username}</span>
          </>
        )}
        <i className="bi bi-box-arrow-right" onClick={handleLogout} title="Logout"></i>
      </div>
    </nav>
  );
}

export default CustomNavbar;