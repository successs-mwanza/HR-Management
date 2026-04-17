import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const [openIndex, setOpenIndex] = useState(null);

  const menu = [

   // main Home dashboard item
    {name:"Main Dashboard",
    icon: "bi bi-speedometer2",
    link: "/crm"},

    
// employee menu with submenus
    {
      name: "Employees",
      icon: "bi bi-people",
      children: [
      { name: "Employee", icon:"bi bi-person", link: "/Employees" },
      
         { name: "Attendance", icon:"bi-calendar-check", link: "/attendance" },
       
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

    {name: "Invoice",
    icon: "bi bi-receipt",
    link: "/invoice"},
    {
      name:"payslip",
      icon: "bi bi-file-earmark-text",
      link: "/payslip"
    },

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
                if (item.link) {
                  // If it's a link item, just navigate and close sidebar
                  setSidebarOpen(false);
                } else if (item.children) {
                  // If it has children, toggle the dropdown
                  toggleMenu(index);
                }
              }}
            >
              <span>
                <i className={`${item.icon} me-2`}></i>
                {item.name}
              </span>

              {/* Only show dropdown arrow if item has children */}
              {item.children && (
                <i
                  className={`bi ${
                    openIndex === index ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                ></i>
              )}
            </div>

            {/* Submenu */}
            {openIndex === index && item.children && (
              <ul className="submenu">
                {item.children.map((child, i) => (
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