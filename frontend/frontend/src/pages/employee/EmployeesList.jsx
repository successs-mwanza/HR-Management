import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../employee/EmployeeProfile"


function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    fetch("http://localhost:8080/api/employees")
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching employees:", error));
  };

  const handleViewProfile = (id) => {
    navigate(`/employee-profile/${id}`);
  };
 
  const handleEdit = (id) => {
    navigate(`/edit-employee/${id}`);
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this employee?")) {
      fetch(`http://localhost:8080/api/employees/${id}`, {
        method: "DELETE",
      })
      .then((response) => {
        if (response.ok) {
          setEmployees(employees.filter(emp => emp.id !== id));
        }
      })
      .catch((error) => console.error("Error deleting employee:", error));
    }
  };

  return (
    <div className="content">
      
      <div className="list-header">
        <h2 className="title">Employees List</h2>
        <button 
          className="add-btn"
          onClick={() => navigate("/add-employee")}
        >
          + Add Employee
        </button>
      </div>

      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.firstName}</td>
                <td>{emp.middleName}</td>
                <td>{emp.lastName}</td>
                <td className="action-buttons">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewProfile(emp.id)}
                  >
                    View
                  </button>
                  <button 
                    className="edit-table-btn"
                    onClick={() => handleEdit(emp.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-table-btn"
                    onClick={() => handleDelete(emp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeesList;


