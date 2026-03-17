import { useState } from "react";
import "../payroll/payroll.css";

function Payroll() {
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);

  const netSalary = basicSalary + allowances - deductions;

  return (
    <div className="payroll-container">
      
      {/* Header */}
      <div className="payroll-header">
        <h1>Payroll Management</h1>
        <button className="process-btn">Process Salary</button>
      </div>

      {/* Form Section */}
      <div className="payroll-form">

        <div className="form-group">
          <label>Employee</label>
          <select>
            <option>Select Employee</option>
          </select>
        </div>

        <div className="form-group">
          <label>Basic Salary</label>
          <input 
            type="number" 
            onChange={(e) => setBasicSalary(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Allowances</label>
          <input 
            type="number" 
            onChange={(e) => setAllowances(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Deductions</label>
          <input 
            type="number" 
            onChange={(e) => setDeductions(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="payroll-summary">
        <div className="card income">
          <span>Basic Salary</span>
          <h2>{basicSalary}</h2>
        </div>

        <div className="card allowance">
          <span>Allowances</span>
          <h2>{allowances}</h2>
        </div>

        <div className="card deduction">
          <span>Deductions</span>
          <h2>{deductions}</h2>
        </div>

        <div className="card net">
          <span>Net Salary</span>
          <h2>{netSalary}</h2>
        </div>
      </div>

    </div>
  );
}

export default Payroll;