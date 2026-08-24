import { useState, useEffect } from "react";


function Payroll() {
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ added

  const netSalary =
    (basicSalary || 0) + (allowances || 0) - (deductions || 0);

  // ✅ Fetch employees with loading state
  useEffect(() => {
    const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
    fetch(`${BASE}/employees`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Employees:", data); // debug
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Handle employee selection
  const handleEmployeeChange = (e) => {
    const empId = Number(e.target.value);
    const emp = employees.find((emp) => emp.id === empId);
    setSelectedEmployee(emp);
  };

  // Process salary
  const handleProcessSalary = () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    const payload = {
      employeeId: selectedEmployee.id,
      basicSalary,
      allowances,
      deductions,
      netSalary,
    };

    const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
    fetch(`${BASE}/payroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => alert("Salary processed successfully!"))
      .catch((err) => console.error(err));
  };

  // Generate payslip
  const handleGeneratePayslip = () => {
    if (!selectedEmployee) {
      alert("Select employee first");
      return;
    }

    alert(`
Employee: ${selectedEmployee.name}
Basic Salary: K ${basicSalary}
Allowances: K ${allowances}
Deductions: K ${deductions}
Net Salary: K ${netSalary}
    `);
  };

  return (
    <div className="payroll-container">
      {/* HEADER */}
      <div className="payroll-header">
        <h1>Payroll Management</h1>
      </div>

      {/* FORM */}
      <div className="payroll-form">
        <div className="form-group">
          <label>Employee</label>
          <select
            value={selectedEmployee?.id || ""}
            onChange={handleEmployeeChange}
          >
            {/* ✅ Loading state */}
            {loading ? (
              <option>Loading employees...</option>
            ) : employees.length === 0 ? (
              <option>No employees found</option>
            ) : (
              <>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.middleName} {emp.lastName}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Basic Salary</label>
          <input
            type="number"
            value={basicSalary}
            onChange={(e) => setBasicSalary(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Allowances</label>
          <input
            type="number"
            value={allowances}
            onChange={(e) => setAllowances(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Deductions</label>
          <input
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(Number(e.target.value))}
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="payroll-summary">
        <div className="card income">
          <span>Basic Salary</span>
          <h2>K {basicSalary.toLocaleString()}</h2>
        </div>

        <div className="card allowance">
          <span>Allowances</span>
          <h2>K {allowances.toLocaleString()}</h2>
        </div>

        <div className="card deduction">
          <span>Deductions</span>
          <h2>K {deductions.toLocaleString()}</h2>
        </div>

        <div className="card net">
          <span>Net Salary</span>
          <h2>K {netSalary.toLocaleString()}</h2>
        </div>
      </div>

      {/* BUTTONS - Updated with new styling */}
      <div className="button-container">
        <button
          className="process-btn"
          onClick={handleProcessSalary}
          disabled={!selectedEmployee}
        >
          Process Salary
        </button>

        <button
          className="process-btn"
          onClick={handleGeneratePayslip}
          disabled={!selectedEmployee}
        >
          Generate Payslip
        </button>
      </div>
    </div>
  );
}

export default Payroll;