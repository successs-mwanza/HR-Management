
import { useNavigate } from "react-router-dom";

function Crm() {
  const navigate = useNavigate();

  return (
    <div className="crm-container">
      <h1>Human Resource Management System</h1>
      <p>
        Manage employees, payroll, and finances in one powerful system.
      </p>    

      {/* Buttons */}
      <div className="crm-buttons">
        <button className="crm-btn primary" onClick={() => navigate("/login")}>
          Get Started
        </button>
       
      </div>

      {/* Feature Cards */}
      <div className="crm-cards">
        <div className="crm-card">
          <h3>Employees</h3>
          <p>Manage employee records and profiles easily.</p>
        </div>

        <div className="crm-card">
          <h3>Payroll</h3>
          <p>Process salaries, allowances, and deductions.</p>
        </div>

        <div className="crm-card">
          <h3>Finance</h3>
          <p>Track income, expenses, and transactions.</p>
        </div>
      </div>
    </div>
  );
}

export default Crm;