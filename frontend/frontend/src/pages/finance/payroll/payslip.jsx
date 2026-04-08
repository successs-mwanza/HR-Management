import { useState } from "react";


function Payslip() {
  const [data, setData] = useState({
    employeeName: "",
    employeeId: "",
    position: "",
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    date: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]:
        name === "basicSalary" ||
        name === "allowances" ||
        name === "deductions"
          ? Number(value)
          : value
    });
  };

  const grossPay = data.basicSalary + data.allowances;
  const netPay = grossPay - data.deductions;

  return (
    <div className="payslip-container">
      <h2>Payslip Generator</h2>

      {/* Employee Info */}
      <input name="employeeName" placeholder="Employee Name" onChange={handleChange} />
      <input name="employeeId" placeholder="Employee ID" onChange={handleChange} />
      <input name="position" placeholder="Position" onChange={handleChange} />
      <input name="date" type="date" onChange={handleChange} />

      <h3>Salary Details</h3>

      <input
        name="basicSalary"
        type="number"
        placeholder="Basic Salary"
        onChange={handleChange}
      />

      <input
        name="allowances"
        type="number"
        placeholder="Allowances"
        onChange={handleChange}
      />

      <input
        name="deductions"
        type="number"
        placeholder="Deductions"
        onChange={handleChange}
      />

      {/* Summary */}
      <div className="summary">
        <p>Gross Pay: ZMW {grossPay.toFixed(2)}</p>
        <p>Deductions: ZMW {data.deductions.toFixed(2)}</p>
        <h3>Net Pay: ZMW {netPay.toFixed(2)}</h3>
      </div>

      {/* Print */}
      <button onClick={() => window.print()}>Print Payslip</button>
    </div>
  );
}
 

export default Payslip;