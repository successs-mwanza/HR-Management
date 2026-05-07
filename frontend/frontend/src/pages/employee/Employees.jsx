import { useState, useEffect, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    dateRange: "all",
  });
  const menuWrapperRef = useRef(null);

  // Modal states
  const [showMenuFor, setShowMenuFor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    position: "",
    status: "",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    departmentCount: {},
    positionCount: {},
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
      calculateStatistics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const stats = {
      totalEmployees: data.length,
      activeEmployees: data.filter((emp) => emp.status === "Active").length,
      inactiveEmployees: data.filter((emp) => emp.status !== "Active").length,
      departmentCount: {},
      positionCount: {},
    };

    data.forEach((emp) => {
      stats.departmentCount[emp.department] =
        (stats.departmentCount[emp.department] || 0) + 1;
      stats.positionCount[emp.position] =
        (stats.positionCount[emp.position] || 0) + 1;
    });

    setStatistics(stats);
  };

  const getFilteredEmployees = () => {
    return employees.filter((emp) => {
      if (filters.department && emp.department !== filters.department)
        return false;
      if (filters.status && emp.status !== filters.status) return false;
      return true;
    });
  };

  const filteredEmployees = getFilteredEmployees();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuWrapperRef.current &&
        !menuWrapperRef.current.contains(event.target)
      ) {
        setShowMenuFor(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // Handle menu toggle
  const toggleMenu = (employeeId) => {
    setShowMenuFor(showMenuFor === employeeId ? null : employeeId);
  };

  // Handle View Profile
  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
    setShowMenuFor(null);
  };

  // Handle Edit
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      status: employee.status,
    });
    setShowEditModal(true);
    setShowMenuFor(null);
  };

  // Handle Delete
  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
    setShowMenuFor(null);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/employees/${selectedEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error("Failed to update employee");

      // Refresh employee list
      await fetchEmployees();
      setShowEditModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      alert("Error updating employee: " + err.message);
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/employees/${selectedEmployee.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      // Refresh employee list
      await fetchEmployees();
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      alert("Error deleting employee: " + err.message);
    }
  };

  // Export Report
  const handleExport = () => {
    const reportData = filteredEmployees.map(emp => ({
      Name: `${emp.firstName} ${emp.lastName}`,
      Email: emp.email,
      Department: emp.department,
      Position: emp.position,
      Status: emp.status
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(reportData[0] || {}).join(",") + "\n"
      + reportData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employee_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Employee Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
     

      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1>
            <i className="bi bi-file-earmark-text"></i> Employee Reports
          </h1>
          <p>Comprehensive employee analytics and statistics</p>
        </div>
        <button className="btn-export" onClick={handleExport}>
          <i className="bi bi-download"></i> Export Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <p className="stat-number">{statistics.totalEmployees}</p>
            <small>Active: {statistics.activeEmployees}</small>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Active Employees</h3>
            <p className="stat-number">{statistics.activeEmployees}</p>
            <small>
              {(
                ((statistics.activeEmployees / statistics.totalEmployees) *
                  100) || 0
              ).toFixed(1)}
              %
            </small>
          </div>
        </div>

        <div className="stat-card inactive">
          <div className="stat-icon">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Inactive Employees</h3>
            <p className="stat-number">{statistics.inactiveEmployees}</p>
            <small>
              {(
                ((statistics.inactiveEmployees / statistics.totalEmployees) *
                  100) || 0
              ).toFixed(1)}
              %
            </small>
          </div>
        </div>

        <div className="stat-card departments">
          <div className="stat-icon">
            <i className="bi bi-building"></i>
          </div>
          <div className="stat-content">
            <h3>Departments</h3>
            <p className="stat-number">
              {Object.keys(statistics.departmentCount).length}
            </p>
            <small>Active departments</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
              className="filter-select"
            >
              <option value="">All Departments</option>
              {Object.keys(statistics.departmentCount).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <button
            className="btn-reset-filters"
            onClick={() =>
              setFilters({ department: "", status: "", dateRange: "all" })
            }
          >
            <i className="bi bi-arrow-clockwise"></i> Reset Filters
          </button>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="reports-grid">
        <div className="report-card">
          <h2>Employees by Department</h2>
          <div className="department-list">
            {Object.entries(statistics.departmentCount)
              .sort(([, a], [, b]) => b - a)
              .map(([dept, count]) => (
                <div key={dept} className="department-item">
                  <div className="dept-info">
                    <span className="dept-name">{dept}</span>
                    <span className="dept-count">{count} employees</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(count / statistics.totalEmployees) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="report-card">
          <h2>Positions Distribution</h2>
          <div className="position-list">
            {Object.entries(statistics.positionCount)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([pos, count]) => (
                <div key={pos} className="position-item">
                  <span className="position-name">{pos}</span>
                  <span className="position-badge">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Employee List Table with Action Menu */}
      <div className="table-section">
        <div className="table-header">
          <h2>Filtered Employee List ({filteredEmployees.length})</h2>
        </div>
        {filteredEmployees.length > 0 ? (
          <div className="table-wrapper" ref={menuWrapperRef}>
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th style={{ width: "60px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="employee-name">
                        <div className="avatar">
                          {emp.firstName?.charAt(0)}
                          {emp.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="name">
                            {emp.firstName} {emp.lastName}
                          </p>
                        </div>
                      </div>
                    </td> 
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span
                        className={`status-badge status-${emp.status?.toLowerCase()}`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-menu-container">
                        <button
                          type="button"
                          className="menu-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(emp.id);
                          }}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        {showMenuFor === emp.id && (
                          <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="menu-item"
                              onClick={() => handleViewProfile(emp)}
                            >
                              <i className="bi bi-eye"></i> View Profile
                            </button>
                            <button
                              className="menu-item"
                              onClick={() => handleEdit(emp)}
                            >
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <div className="divider"></div>
                            <button
                              className="menu-item delete"
                              onClick={() => handleDelete(emp)}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <i className="bi bi-inbox"></i>
            <p>No employees found matching the selected filters</p>
          </div>
        )}
      </div>

      {/* View Profile Modal */}
      {showViewModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Employee Profile</h3>
              <button className="close-modal" onClick={() => setShowViewModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar-large">
                {selectedEmployee.firstName?.charAt(0)}
                {selectedEmployee.lastName?.charAt(0)}
              </div>
              <div className="profile-field">
                <strong>Full Name:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}
              </div>
              <div className="profile-field">
                <strong>Email:</strong> {selectedEmployee.email}
              </div>
              <div className="profile-field">
                <strong>Department:</strong> {selectedEmployee.department}
              </div>
              <div className="profile-field">
                <strong>Position:</strong> {selectedEmployee.position}
              </div>
              <div className="profile-field">
                <strong>Status:</strong> {selectedEmployee.status}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Employee</h3>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={editFormData.position}
                  onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>?</p>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;  