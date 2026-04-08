import "bootstrap-icons/font/bootstrap-icons.css";



function Navbar({ sidebarOpen, setSidebarOpen }) {
  
  const handleLogout = () => {
  localStorage.removeItem("token");
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

      </div>

      {/* Right side */}
      <div className="nav-right">

        <i className="bi bi-search"></i>

        <i className="bi bi-bell"></i>

        <i className="bi bi-person-circle"></i>

      </div>

    </nav>
  );
}

export default Navbar;