import { useState } from "react";

function Payslip() {
  const [data, setData] = useState({
    name: "",
    id: "",
    department: "",
    description: "",
    earnings: 0,
    deduction: 0,
    nhima: 0,
    napsa: 0,
    paye: 0,
    bankName: "",
    bankAccount: "",
    date: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]:
        ["earnings", "deduction", "nhima", "napsa", "paye"].includes(name)
          ? Number(value)
          : value
    });
  };

  // Calculations
  const totalDeductions =
    data.deduction + data.nhima + data.napsa + data.paye;

  const total = data.earnings;
  const netPay = total - totalDeductions;

  return (
    <div className="payslip-container">
      <h2>Payslip</h2>

      {/* Employee Info */}
      <input name="name" placeholder="Employee Name" onChange={handleChange} />
      <input name="id" placeholder="Employee ID" onChange={handleChange} />
      <input name="department" placeholder="Department" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input type="date" name="date" onChange={handleChange} />

      <h3>Earnings</h3>
      <input
        name="earnings"
        type="number"
        placeholder="Total Earnings"
        onChange={handleChange}
      />

      <h3>Deductions</h3>
      <input
        name="deduction"
        type="number"
        placeholder="Other Deductions"
        onChange={handleChange}
      />
      <input
        name="nhima"
        type="number"
        placeholder="NHIMA"
        onChange={handleChange}
      />
      <input
        name="napsa"
        type="number"
        placeholder="NAPSA"
        onChange={handleChange}
      />
      <input
        name="paye"
        type="number"
        placeholder="PAYE"
        onChange={handleChange}
      />

      <h3>Bank Details</h3>
      <input
        name="bankName"
        placeholder="Bank Name"
        onChange={handleChange}
      />
      <input
        name="bankAccount"
        placeholder="Bank Account"
        onChange={handleChange}
      />

      {/* Summary */}
      <div className="summary">
        <p>Total Earnings: ZMW {total.toFixed(2)}</p>
        <p>Total Deductions: ZMW {totalDeductions.toFixed(2)}</p>
        <h3>Net Pay: ZMW {netPay.toFixed(2)}</h3>
      </div>

      {/* Printable Section */}
      <div className="payslip-preview">
        <h2>Employee Payslip</h2>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>ID:</strong> {data.id}</p>
        <p><strong>Department:</strong> {data.department}</p>
        <p><strong>Description:</strong> {data.description}</p>

        <hr />

        <p><strong>Earnings:</strong> ZMW {total.toFixed(2)}</p>

        <p><strong>NHIMA:</strong> ZMW {data.nhima.toFixed(2)}</p>
        <p><strong>NAPSA:</strong> ZMW {data.napsa.toFixed(2)}</p>
        <p><strong>PAYE:</strong> ZMW {data.paye.toFixed(2)}</p>
        <p><strong>Other Deductions:</strong> ZMW {data.deduction.toFixed(2)}</p>

        <p><strong>Total Deductions:</strong> ZMW {totalDeductions.toFixed(2)}</p>

        <h3><strong>Net Pay:</strong> ZMW {netPay.toFixed(2)}</h3>

        <hr />

        <p><strong>Bank:</strong> {data.bankName}</p>
        <p><strong>Account:</strong> {data.bankAccount}</p>
        <p><strong>Date:</strong> {data.date}</p>
      </div>

      {/* Print */}
      <button onClick={() => window.print()}>Print Payslip</button>
    </div>
  );
}

export default Payslip;