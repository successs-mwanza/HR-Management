import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Navbar from "./dashboard/Navbar/Navigationbar";
import Sidebar from "./dashboard/Sidebar/AppSidebar";
import EmployeesList from "./pages/employee/EmployeesList";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import AddEmployee from "./pages/employee/AddEmployee";
import EditEmployee from "./pages/employee/EditEmployee";
import IncomeExpense from "./pages/finance/income_expenses/incom_expense";
import TransactionHistory from "./pages/finance/income_expenses/TransactionHistory";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
        <Routes>
          <Route path="/" element={<EmployeesList />} />
          <Route path="/employee-profile/:id" element={<EmployeeProfile />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/edit-employee/:id" element={<EditEmployee />} />
          <Route path="/income-expenses" element={<IncomeExpense />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;