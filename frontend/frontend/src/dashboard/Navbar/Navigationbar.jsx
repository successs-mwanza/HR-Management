import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";

function Navbar({ sidebarOpen, setSidebarOpen }) {
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

        <h2 className="logo">
          <i className="bi bi-people-fill"></i> HR Dashboard
        </h2>
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