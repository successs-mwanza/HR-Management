import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import hrLogo from "./human-resource-logo-design-inspiration-vector-illustration_500223-487.avif";


function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const [openIndex, setOpenIndex] = useState(null);

  const menu = [

   // main Home dashboard item
    {name:"Main Dashboard",
    icon: "bi bi-speedometer2",
    link: "/dashboard"},

    
// employee menu with submenus
    {
      name: "Employee Management",
      icon: "bi bi-people",
      children: [
      { name: "Employee", icon:"bi bi-person", link: "/employees" },
      
         { name: "Attendance", icon:"bi-calendar-check", link: "/attendance" },
       
      ]
      
    },
 
    //Tasks item
    {
      name: "Tasks Management",
      icon: "bi bi-list-check",
      link: "/tasks"
    },
    //Finance item
    {
      name: "Financial Management",
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

    {name:"income & Expenses",
    icon: "bi bi-graph-up",
    link: "/income-expenses"}
      ]
    },

    //Reports & Analytics item
    {
    name: "Reports & Analytics",
    icon: "bi bi-graph-up",
    children: [
      { name: "Sales Reports", icon: "bi bi-bar-chart", link: "/sales-reports" },
      { name: "Performance Analytics", icon: "bi bi-pie-chart", link: "/performance-analytics" }, 
      { name: "Employee Reports", icon: "bi bi-people", link: "/employee-reports" },
      { name: "Financial Reports", icon: "bi bi-cash-coin", link: "/financial-reports" },
    ]
  },

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
<div className="sidebar-header d-flex align-items-center">
  <img src={hrLogo} alt="HR Logo" className="sidebar-logo-img" />
  <div className="sidebar-header-text">
    <h5 className="fw-bold mb-1" style={{ marginLeft: "50px", padding: "0" }}>HR</h5>
    <h6 className="text-italics mb-1">Management System</h6>
  </div>
</div>

      <ul className="sidebar-list">

        {menu.map((item, index) => (
          <li key={index}>

            {/* Parent Menu */}
            {item.link ? (
              <Link
                to={item.link}
                className="sidebar-parent d-flex align-items-center justify-content-between"
                onClick={() => setSidebarOpen(false)}
              >
                <span>
                  <i className={`${item.icon} me-2`}></i>
                  {item.name}
                </span>
                {item.children && (
                  <i
                    className={`bi ${
                      openIndex === index ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                )}
              </Link>
            ) : (
              <div
                className="sidebar-parent d-flex align-items-center justify-content-between"
                onClick={() => {
                  if (item.children) {
                    toggleMenu(index);
                  }
                }}
              >
                <span>
                  <i className={`${item.icon} me-2`}></i>
                  {item.name}
                </span>
                {item.children && (
                  <i
                    className={`bi ${
                      openIndex === index ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                )}
              </div>
            )}

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