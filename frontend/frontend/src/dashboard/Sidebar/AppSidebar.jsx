import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./sidebar.css";

function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const [openIndex, setOpenIndex] = useState(null);

// employee menu with submenus
  const menu = [
    {
      name: "Employees",
      icon: "bi bi-people",
      children: [
      { name: "Employee Profile", icon:"bi bi-person", link: "/" },
        { name: "Labour Management", icon:"bi bi-diagram-3", link: "/labour-management" },
         { name: "Attendance", icon:"bi-calendar-check", link: "/attendance" },
          { name: "leave Management", icon:"bi-calendar-check", link: "/leave" }
      ]
      
    },
    //Tasks item
    {
      name: "Tasks",
      icon: "bi bi-list-check"
    },
    //Finance item
    {
      name: "Finance",
      icon: "bi bi-cash-coin",
      children: [
        {
          name: "Payroll",
          icon: "bi bi-people",
          link: "/payroll"
        },
      
      {name: "Budgeting",
      icon: "bi bi-pie-chart",
      link: "/budgeting"
    },
    {name: "Invoicing",
    icon: "bi bi-receipt",
    link: "/invoicing"},
    {name: "Financial Reports",
    icon: "bi bi-bar-chart",
    link: "/financial-reports"},
    {name:"income & Expenses",
    icon: "bi bi-graph-up",
    link: "/income-expenses"}
      ]
    },
    //Checklist item
    {
      name: "Checklist",
      icon: "bi bi-gear",
      link: "/settings"
    },
    //Reports item
    {
      name: "Reports",  
      icon: "bi bi-bar-chart",
      link: "/reports"
    }

  ];
  const toggleMenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      <div className={`sidebar shadow-lg ${sidebarOpen ? "mobile-open" : ""}`}>

      <div className="sidebar-header text-center">
        <h5 className="fw-bold">
          <i className="bi bi-speedometer2 me-2"></i>
          Admin Dashboard
        </h5>
      </div>

      <ul className="sidebar-list">

        {menu.map((item, index) => (
          <li key={index}>

            {/* Parent Menu */}
            <div
              className="sidebar-parent d-flex align-items-center justify-content-between"
              onClick={() => {
                toggleMenu(index);
                if (!item.children && item.link) {
                  setSidebarOpen(false);
                }
              }}
            >
              <span>
                <i className={`${item.icon} me-2`}></i>
                {item.name}
              </span>

              <i
                className={`bi ${
                  openIndex === index ? "bi-chevron-up" : "bi-chevron-down"
                }`}
              ></i>
            </div>

            {/* Submenu */}
            {openIndex === index && (
              <ul className="submenu">
                {item.children && item.children.map((child, i) => (
                  <li key={i}>
                    <Link to={child.link} onClick={() => setSidebarOpen(false)}>
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

      </div>
    </>
  );
}

export default Sidebar;