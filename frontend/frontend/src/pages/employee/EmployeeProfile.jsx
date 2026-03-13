import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../employee/EmployeeProfile.css";

function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/api/employees/${id}`)
        .then((response) => {
          if (!response.ok) throw new Error("Employee not found");
          return response.json();
        })
        .then((data) => {
          setEmployee(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleDelete = async () => {
    if(window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete employee");
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading employee details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!employee) return <div className="error">Employee not found</div>;

  return (
    <div className="employee-profile-container">
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to List
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <h1>
            {employee.firstName} {employee.middleName} {employee.lastName}
          </h1>
          <p className="employee-id">ID: {employee.id}</p>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Personal Information</h3>
            <div className="detail-row">
              <label>First Name:</label>
              <span>{employee.firstName}</span>
            </div>
            <div className="detail-row">
              <label>Middle Name:</label>
              <span>{employee.middleName || "N/A"}</span>
            </div>
            <div className="detail-row">
              <label>Last Name:</label>
              <span>{employee.lastName}</span>
            </div>
          </div>

          {employee.email && (
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-row">
                <label>Email:</label>
                <span>{employee.email}</span>
              </div>
            </div>
          )}

          {employee.department && (
            <div className="detail-section">
              <h3>Employment Details</h3>
              <div className="detail-row">
                <label>Department:</label>
                <span>{employee.department}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button 
            className="edit-btn"
            onClick={() => navigate(`/edit-employee/${id}`)}
          >
            ✎ Edit
          </button>
          <button 
            className="delete-btn"
            onClick={handleDelete}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeProfile;
