import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import "./dashboard/Sidebar/Sidebar.css";
import CustomNavbar from "./dashboard/Navbar/CustomNavBar";
import Sidebar from "./dashboard/Sidebar/AppSidebar";

// import AddEmployee from "./pages/employee/AddEmployee";                      
// import EditEmployee from "./pages/employee/EditEmployee";
import IncomeExpense from "./pages/finance/income_expenses/incom_expense";
import TransactionHistory from "./pages/finance/income_expenses/TransactionHistory";
import Payroll from "./pages/finance/payroll/payroll";
import Crm from "./landingPage/Crm";
import Signup from "./Login_Signup/signup";
import Login from "./Login_Signup/login";
import Invoice from "./pages/finance/invoice/invoice";
import DashboardCRM from "./MainDashboard/dashboardCRM";
import Payslip from "./pages/finance/payroll/payslip";
import Attendance from "./pages/employee/Attendance";
import EmployeeReport from "./pages/employee/EmployeeReport"
import Employees from "./pages/employee/Employees";
// import EmployeeReports from "./pages/reports & analytics/Employee Reports";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // pages where navbar/sidebar should NOT appear
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="app-container">
      {/* Hide sidebar/navbar on landing/login/signup */}
      {!hideLayout && (
        <>
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <CustomNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </>
      )}

      {/* Cont */}
      <div className={!hideLayout ? "content-wrapper" : ""}>
        <div className={!hideLayout ? "page-container" : ""}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Crm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/employees" element={<Employees />} /> 
            <Route path="/attendance" element={<Attendance />} /> 
            <Route path="/dashboard" element={<DashboardCRM />} />
            
            {/* Employee Report Route - with employeeId parameter */}
            <Route path="/employee-report/:employeeId" element={<EmployeeReport />} />

            {/* <Route path="/addemployee" element={<AddEmployee />} /> */}

            {/* Finance Routes */}
            <Route path="/income-expenses" element={<IncomeExpense />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payslip" element={<Payslip />} />

            {/* Reports and Analytics Routes */}
            {/* <Route path="/employee-reports" element={<EmployeeReports />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;