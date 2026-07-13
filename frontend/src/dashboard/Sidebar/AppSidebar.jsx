import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import hrLogo from "./human-resource-logo-design-inspiration-vector-illustration_500223-487.avif";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");
  const location = useLocation();

  const menu = [
    { name: "Main Dashboard", icon: "bi bi-speedometer2", link: "/dashboard" },

    {
      name: "Employee Management",
      icon: "bi bi-people",
      children: [
        { name: "Employee", icon: "bi bi-person", link: "/employees" },
        { name: "Productivity Monitoring", icon: "bi bi-speedometer2", link: "/productivity" },
        { name: "Leave Management", icon: "bi bi-calendar-check", link: "/leave" },
      ]
    },

   
    {
      name: "Financial Management",
      icon: "bi bi-cash-coin",
      children: [
        { name: "Payroll", icon: "bi bi-people", link: "/payroll" },
        { name: "Budgeting", icon: "bi bi-pie-chart", link: "/budgeting" },
        { name: "Invoice", icon: "bi bi-receipt", link: "/invoice" },
        { name: "Payslip", icon: "bi bi-file-earmark-text", link: "/payslip" },
        { name: "Income & Expenses", icon: "bi bi-graph-up", link: "/income-expenses" }
      ]
    },

    {
      name: "Reports & Analytics",
      icon: "bi bi-graph-up",
      children: [
        { name: "Sales Reports", icon: "bi bi-bar-chart", link: "/sales-reports" },
        { name: "Performance Analytics", icon: "bi bi-pie-chart", link: "/performance-analytics" },
  
        { name: "Financial Reports", icon: "bi bi-cash-coin", link: "/financial-reports" },
      ]
    },

     {
      name: "Tasks Management",
      icon: "bi bi-list-check",
      link: "/tasks"
    },

  ];

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      const firstName = storedUsername.split(" ")[0];
      setUserFirstName(firstName);
    }

    // Fetch from backend for more complete user data
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
            const firstName = data.name.split(" ")[0];
            setUserFirstName(firstName);
            localStorage.setItem("username", data.name);
          } else if (data.firstName) {
            setUserFirstName(data.firstName);
            localStorage.setItem("username", `${data.firstName} ${data.lastName || ""}`);
          }
        })
        .catch(err => console.error("Error fetching user:", err));
    }
  }, []);

  const toggleMenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  const isActiveLink = (link) => {
    return location.pathname === link;
  };

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.link);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      <div className={`sidebar shadow-lg ${sidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header d-flex align-items-center">
          <img src={hrLogo} alt="HR Logo" className="sidebar-logo-img" />
          <div className="sidebar-header-text">
            <h5 className="fw-bold mb-1">HR</h5>
            <h6 className="text-italics mb-1">Management System</h6>
          </div>
        </div>

        {/* Menu items */}
        <ul className="sidebar-list">
          {menu.map((item, index) => (
            <li key={index}>
              {/* Parent Menu */}
              {item.link ? (
                <Link
                  to={item.link}
                  className={`sidebar-parent d-flex align-items-center justify-content-between ${isActiveLink(item.link) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="d-flex align-items-center">
                    <i className={`${item.icon} me-2 sidebar-icon`}></i>
                    {item.name}
                  </span>
                  {item.children && (
                    <i className={`bi ${openIndex === index ? "bi-chevron-up" : "bi-chevron-down"} toggle-icon`}></i>
                  )}
                </Link>
              ) : (
                <div
                  className={`sidebar-parent d-flex align-items-center justify-content-between ${isChildActive(item.children) ? 'active' : ''}`}
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(index);
                    }
                  }}
                >
                  <span className="d-flex align-items-center">
                    <i className={`${item.icon} me-2 sidebar-icon`}></i>
                    {item.name}
                  </span>
                  {item.children && (
                    <i className={`bi ${openIndex === index ? "bi-chevron-up" : "bi-chevron-down"} toggle-icon`}></i>
                  )}
                </div>
              )}

              {/* Submenu */}
              {openIndex === index && item.children && (
                <ul className="submenu">
                  {item.children.map((child, i) => (
                    <li key={i}>
                      <Link 
                        to={child.link} 
                        className={isActiveLink(child.link) ? 'active' : ''}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <i className={`${child.icon} me-2`}></i>
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* User Profile Section at Bottom */}
        {userFirstName && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-item" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right sidebar-icon"></i>
              <span>Logout</span>
            </div>
            <div className="sidebar-footer-item" style={{ cursor: 'default', background: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="sidebar-user-avatar" style={{
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
              }}>
                <i className="bi bi-person-circle" style={{ fontSize: '20px' }}></i>
              </div>
              <div className="sidebar-user-info" style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Welcome back,</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{userFirstName}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;