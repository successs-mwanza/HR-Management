import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./dashboard/Navbar/Navigationbar";
import Sidebar from "./dashboard/Sidebar/AppSidebar";
import EmployeesList from "./pages/employee/EmployeesList";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import AddEmployee from "./pages/employee/AddEmployee";
import EditEmployee from "./pages/employee/EditEmployee";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <Navbar />

        <Routes>
          <Route path="/" element={<EmployeesList />} />
          <Route path="/employee-profile/:id" element={<EmployeeProfile />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/edit-employee/:id" element={<EditEmployee />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;