import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS IMPORT
import "bootstrap-icons/font/bootstrap-icons.css";

function EmployeeIndex() {
  const navigate = useNavigate(); // ✅ ADD THIS
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Modal and form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    department: "",
    position: "",
    email: "",
    phone: "",
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    firstName: "",
    middleName: "",
    lastName: "",
    department: "",
    position: "",
    email: "",
    phone: "",
    status: ""
  });

  // Actions Modal state
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // View Profile Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);

  // Employee Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data || data.content || [];
      setEmployees(list);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Auto-hide notification after 2 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch employee report (for the summary modal)
  const fetchEmployeeReport = async () => {
    setLoadingReport(true);
    try {
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(e => e.status === "Active" || !e.status).length;
      const inactiveEmployees = employees.filter(e => e.status === "Inactive").length;
      
      const deptMap = {};
      employees.forEach(emp => {
        const dept = emp.department || "Not Specified";
        if (!deptMap[dept]) {
          deptMap[dept] = { total: 0, active: 0, inactive: 0 };
        }
        deptMap[dept].total++;
        if (emp.status === "Inactive") {
          deptMap[dept].inactive++;
        } else {
          deptMap[dept].active++;
        }
      });
      
      const departmentStats = Object.keys(deptMap).map(dept => ({
        department: dept,
        total: deptMap[dept].total,
        active: deptMap[dept].active,
        inactive: deptMap[dept].inactive
      }));

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentHires = employees
        .filter(emp => {
          if (!emp.hireDate) return false;
          const hireDate = new Date(emp.hireDate);
          return hireDate >= thirtyDaysAgo;
        })
        .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
        .slice(0, 10);

      setReportData({
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments: departmentStats.length,
        departmentStats,
        recentHires
      });
      
      setShowReportModal(true);
    } catch (err) {
      setNotification({
        show: true,
        message: "Error generating report: " + err.message,
        type: "danger"
      });
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDelete = async () => {
    const id = deleteConfirm.id;
    try {
      await fetch(`http://localhost:8081/api/employees/${id}`, {
        method: "DELETE",
      });

      setEmployees(employees.filter((e) => e.id !== id));
      setDeleteConfirm({ show: false, id: null });
      setNotification({
        show: true,
        message: "Employee deleted successfully!",
        type: "success"
      });
    } catch (err) {
      setDeleteConfirm({ show: false, id: null });
      setNotification({
        show: true,
        message: "Error deleting employee: " + err.message,
        type: "danger"
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmployee = async () => {
    if (!formData.firstName || !formData.lastName) {
      setNotification({
        show: true,
        message: "Please fill in First Name and Last Name",
        type: "warning"
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newEmployee = await response.json();
        setEmployees([...employees, newEmployee]);
        setShowAddModal(false);
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          department: "",
          position: "",
          email: "",
          phone: "",
        });
        setNotification({
          show: true,
          message: "Employee added successfully!",
          type: "success"
        });
      } else {
        setNotification({
          show: true,
          message: "Failed to add employee",
          type: "danger"
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Error adding employee: " + err.message,
        type: "danger"
      });
    }
  };

  const handleEditEmployee = async () => {
    if (!editFormData.firstName || !editFormData.lastName) {
      setNotification({
        show: true,
        message: "Please fill in First Name and Last Name",
        type: "warning"
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/api/employees/${editFormData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(employees.map(emp => 
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        ));
        setShowEditModal(false);
        setNotification({
          show: true,
          message: "Employee updated successfully!",
          type: "success"
        });
      } else {
        setNotification({
          show: true,
          message: "Failed to update employee",
          type: "danger"
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        message: "Error updating employee: " + err.message,
        type: "danger"
      });
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(null);
    setEditFormData({
      id: employee.id,
      firstName: employee.firstName || "",
      middleName: employee.middleName || "",
      lastName: employee.lastName || "",
      department: employee.department || "",
      position: employee.position || "",
      email: employee.email || "",
      phone: employee.phone || "",
      status: employee.status || "Active"
    });
    setShowEditModal(true);
    setShowActionsModal(false);
  };

  const openDeleteConfirm = (employee) => {
    setSelectedEmployee(null);
    setDeleteConfirm({ show: true, id: employee.id });
    setShowActionsModal(false);
  };

  const openActionsModal = (employee) => {
    setSelectedEmployee(employee);
    setShowActionsModal(true);
  };

  const openViewModal = (employee) => {
    setViewEmployee(employee);
    setShowViewModal(true);
    setShowActionsModal(false);
  };

  // FILTER
  const filtered = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-danger text-center">{error}</div>;
  
  const activeCount = employees.filter(e => e.status === "Active" || !e.status).length;
  const inactiveCount = employees.filter(e => e.status === "Inactive").length;

  const monthlyRecruitment = employees.filter((e) => {
    if (!e.hireDate) return false;
    const date = new Date(e.hireDate);
    return date.getMonth() === new Date().getMonth() && 
           date.getFullYear() === new Date().getFullYear();
  }).length;

  // Modal overlay style
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050
  };

  const modalDialogStyleLarge = {
    margin: 0,
    width: "100%",
    maxWidth: "700px"
  };

  const modalDialogStyleMedium = {
    margin: 0,
    width: "100%",
    maxWidth: "500px"
  };

  const modalDialogStyleSmall = {
    margin: 0,
    width: "100%",
    maxWidth: "400px"
  };

  const modalContentStyle = {
    backgroundColor: "#c5c5c5",
    border: "none",
    borderRadius: "1rem",
    color: "#000000"
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="container employee-page mt-4">
      {/* HEADER */}
      <div className="employee-header mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            {/* Report Button */}
            <button
              className="btn btn-info text-white"
              onClick={fetchEmployeeReport}
              disabled={loadingReport}
            >
              <i className="bi bi-file-earmark-bar-graph me-1"></i>
              {loadingReport ? 'Generating...' : 'Employee Report'}
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center employee-header-actions">
            <div className="search-wrap d-flex align-items-center border rounded-pill px-2 py-1 bg-white shadow-sm">
              <i className="bi bi-search text-secondary"></i>
              <input
                type="text"
                className="form-control form-control-sm border-0 ms-2 employee-search"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              className="btn btn-primary btn-pill"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="row mb-3 stats-grid g-3">
        <div className="col-md-3">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body text-center">
              <h6>Total Employees</h6>
              <h3>{employees.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body text-center">
              <h6>Active Employees</h6>
              <h3>{activeCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-danger shadow-sm">
            <div className="card-body text-center">
              <h6>Inactive Employees</h6>
              <h3>{inactiveCount}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body text-center">
              <h6>Monthly Recruitment</h6>
              <h3>{monthlyRecruitment}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="card dashboard-card shadow-sm">
        <div className="card-header bg-white border-0 pb-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h5 className="mb-1 fw-bold">Employee Management</h5>
              <p className="text-muted small mb-0">Browse your employee roster and access actions for each team member.</p>
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="badge bg-light text-dark py-2 px-3 shadow-sm">Total: {employees.length}</span>
              <button className="btn btn-outline-secondary btn-sm btn-pill" onClick={() => setCurrentPage(1)}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No employees found. Try adjusting your search or add a new employee.
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-circle-sm">{getInitials(emp.firstName, emp.lastName)}</div>
                        <div>
                          <div className="fw-semi">{emp.firstName} {emp.middleName} {emp.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department || "N/A"}</td>
                    <td>{emp.position || "N/A"}</td>
                    <td>
                      <span className={`badge ${emp.status === "Inactive" ? "status-inactive" : "status-active"} badge-pill`}>
                        {emp.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary action-btn" onClick={() => openActionsModal(emp)}>
                        <i className="bi bi-three-dots-vertical me-1"></i> Actions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary btn-sm btn-pill" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Prev
          </button>
          <span className="text-muted small">Page {currentPage} of {totalPages || 1}</span>
          <button className="btn btn-outline-secondary btn-sm btn-pill" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>

      {/* ========== ALL MODALS ========== */}

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleLarge}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-header py-3" style={{ background: "linear-gradient(135deg, #2943b6 0%)", color: "white", borderRadius: "1rem 1rem 0 0" }}>
                <h5 className="modal-title">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Add New Employee
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body py-4 px-4">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">First Name <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                        <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Middle Name</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person-badge"></i></span>
                        <input type="text" className="form-control" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Enter middle name" />
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Last Name <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                        <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Department</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-building"></i></span>
                        <input type="text" className="form-control" name="department" value={formData.department} onChange={handleInputChange} placeholder="Enter department" />
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Position</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-briefcase"></i></span>
                        <input type="text" className="form-control" name="position" value={formData.position} onChange={handleInputChange} placeholder="Enter position" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" />
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Phone</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                        <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer py-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAddEmployee}>
                  <i className="bi bi-check-lg me-1"></i> Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIONS MODAL - FIXED: Now navigates to employee report */}
      {showActionsModal && selectedEmployee && (
        <div style={modalOverlayStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleSmall}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-header py-3" style={{ background: "linear-gradient(135deg, #d3d5df 0%, #e7e0e7 100%)", borderRadius: "1rem 1rem 0 0" }}>
                <h5 className="modal-title">
                  <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                  Actions
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowActionsModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="text-center mb-3">
                  <div className="avatar-circle mb-2" style={{
                    width: "70px",
                    height: "70px",
                    background: "linear-gradient(135deg, #c7c9d4 0%, #050505 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                  </div>
                  <h6 className="mb-0 fw-bold fs-6">{selectedEmployee.firstName} {selectedEmployee.lastName}</h6>
                  <small className="text-muted">{selectedEmployee.position || "No position"}</small>
                </div>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" onClick={() => openViewModal(selectedEmployee)}>
                    <i className="bi bi-eye me-2"></i> View Profile
                  </button>
                  <button className="btn btn-primary" onClick={() => openEditModal(selectedEmployee)}>
                    <i className="bi bi-pencil-square me-2"></i> Edit Employee
                  </button>
                  <button className="btn btn-danger" onClick={() => openDeleteConfirm(selectedEmployee)}>
                    <i className="bi bi-trash me-2"></i> Delete Employee
                  </button>
                  {/* ✅ FIXED: This now navigates to the dedicated EmployeeReport page */}
                  <button 
                    className="btn btn-info text-white" 
                    onClick={() => {
                      setShowActionsModal(false);
                      navigate(`/employee-report/${selectedEmployee.id}`);
                    }}
                  >
                    <i className="bi bi-file-earmark-bar-graph me-2"></i> View Employee Report
                  </button>
                </div>
              </div>
              <div className="modal-footer py-2 justify-content-center">
                <button type="button" className="btn btn-secondary" onClick={() => setShowActionsModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      {showViewModal && viewEmployee && (
        <div style={modalOverlayStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleMedium}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-header py-3" style={{ background: "linear-gradient(135deg, #2943b6 0%)", color: "white", borderRadius: "1rem 1rem 0 0" }}>
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Employee Profile
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="text-center mb-4">
                  <div className="avatar-large mb-3" style={{
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    fontSize: "40px",
                    fontWeight: "bold",
                    color: "white",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                  }}>
                    {getInitials(viewEmployee.firstName, viewEmployee.lastName)}
                  </div>
                  <h4 className="fw-bold mb-1">{viewEmployee.firstName} {viewEmployee.middleName} {viewEmployee.lastName}</h4>
                  <span className={`badge ${viewEmployee.status === "Inactive" ? "status-inactive" : "status-active"} px-3 py-2`}>
                    {viewEmployee.status || "Active"}
                  </span>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="info-card p-3 rounded" style={{ background: "#f8fafc", borderRadius: "0.75rem" }}>
                      <small className="text-muted d-block mb-1"><i className="bi bi-building me-1"></i> Department</small>
                      <strong className="fs-6">{viewEmployee.department || "Not specified"}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-card p-3 rounded" style={{ background: "#f8fafc", borderRadius: "0.75rem" }}>
                      <small className="text-muted d-block mb-1"><i className="bi bi-briefcase me-1"></i> Position</small>
                      <strong className="fs-6">{viewEmployee.position || "Not specified"}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-card p-3 rounded" style={{ background: "#f8fafc", borderRadius: "0.75rem" }}>
                      <small className="text-muted d-block mb-1"><i className="bi bi-envelope me-1"></i> Email</small>
                      <strong className="fs-6">{viewEmployee.email || "Not specified"}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-card p-3 rounded" style={{ background: "#f8fafc", borderRadius: "0.75rem" }}>
                      <small className="text-muted d-block mb-1"><i className="bi bi-telephone me-1"></i> Phone</small>
                      <strong className="fs-6">{viewEmployee.phone || "Not specified"}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer py-3 justify-content-center">
                <button type="button" className="btn btn-primary" onClick={() => {
                  setShowViewModal(false);
                  openEditModal(viewEmployee);
                }}>
                  <i className="bi bi-pencil-square me-1"></i> Edit Profile
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && (
        <div style={modalOverlayStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleLarge}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-header py-3" style={{ background: "linear-gradient(135deg, #2943b6 100%)", color: "white", borderRadius: "1rem 1rem 0 0" }}>
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Employee
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body py-4 px-4">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">First Name <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                        <input type="text" className="form-control" name="firstName" value={editFormData.firstName} onChange={handleEditInputChange} placeholder="Enter first name" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Middle Name</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person-badge"></i></span>
                        <input type="text" className="form-control" name="middleName" value={editFormData.middleName} onChange={handleEditInputChange} placeholder="Enter middle name" />
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Last Name <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-person"></i></span>
                        <input type="text" className="form-control" name="lastName" value={editFormData.lastName} onChange={handleEditInputChange} placeholder="Enter last name" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Department</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-building"></i></span>
                        <input type="text" className="form-control" name="department" value={editFormData.department} onChange={handleEditInputChange} placeholder="Enter department" />
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Position</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-briefcase"></i></span>
                        <input type="text" className="form-control" name="position" value={editFormData.position} onChange={handleEditInputChange} placeholder="Enter position" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                        <input type="email" className="form-control" name="email" value={editFormData.email} onChange={handleEditInputChange} placeholder="Enter email" />
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                        <input type="tel" className="form-control" name="phone" value={editFormData.phone} onChange={handleEditInputChange} placeholder="Enter phone number" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-toggle-on"></i></span>
                        <select className="form-select" name="status" value={editFormData.status} onChange={handleEditInputChange}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer py-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditEmployee}>
                  <i className="bi bi-check-lg me-1"></i> Update Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div style={modalOverlayStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleSmall}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-header py-3" style={{ background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", color: "white", borderRadius: "1rem 1rem 0 0" }}>
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirm Delete
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteConfirm({ show: false, id: null })}></button>
              </div>
              <div className="modal-body py-4 text-center">
                <i className="bi bi-trash3-fill" style={{ fontSize: "60px", color: "#dc2626" }}></i>
                <p className="mb-2 mt-3 fw-semibold fs-6">Are you sure you want to delete this employee?</p>
                <p className="text-danger mb-0 small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer py-3">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirm({ show: false, id: null })}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE REPORT MODAL - FIXED: Removed the extra button */}
      {showReportModal && reportData && (
        <div style={modalOverlayStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleLarge}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-header py-3" style={{ background: "linear-gradient(135deg, #2325b1 100%)", color: "white", borderRadius: "1rem 1rem 0 0" }}>
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>
                  Employee Report
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReportModal(false)}></button>
              </div>
              <div className="modal-body py-4 px-4">
                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h6>Total Employees</h6>
                        <h3>{reportData.totalEmployees}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success text-white">
                      <div className="card-body text-center">
                        <h6>Active</h6>
                        <h3>{reportData.activeEmployees}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-danger text-white">
                      <div className="card-body text-center">
                        <h6>Inactive</h6>
                        <h3>{reportData.inactiveEmployees}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body text-center">
                        <h6>Departments</h6>
                        <h3>{reportData.totalDepartments}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department-wise breakdown */}
                <h6 className="fw-bold mb-3">Department-wise Distribution</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Department</th>
                        <th>Total</th>
                        <th>Active</th>
                        <th>Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.departmentStats && reportData.departmentStats.length > 0 ? (
                        reportData.departmentStats.map((dept, index) => (
                          <tr key={index}>
                            <td>{dept.department}</td>
                            <td>{dept.total}</td>
                            <td>{dept.active}</td>
                            <td>{dept.inactive}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No department data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Recent hires */}
                <h6 className="fw-bold mt-4 mb-3">Recent Hires (Last 30 Days)</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Hire Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.recentHires && reportData.recentHires.length > 0 ? (
                        reportData.recentHires.map((emp, index) => (
                          <tr key={index}>
                            <td>{emp.firstName} {emp.lastName}</td>
                            <td>{emp.department || 'N/A'}</td>
                            <td>{emp.position || 'N/A'}</td>
                            <td>{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No recent hires</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer py-3 justify-content-center">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i> Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      {notification.show && (
        <div style={{ ...modalOverlayStyle, zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyleSmall}>
            <div className="modal-content" style={modalContentStyle}>
              <div className={`modal-header bg-${notification.type} text-white py-3`}>
                <h5 className="modal-title">
                  {notification.type === "success" && <i className="bi bi-check-circle-fill me-2"></i>}
                  {notification.type === "danger" && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                  {notification.type === "warning" && <i className="bi bi-exclamation-circle-fill me-2"></i>}
                  {notification.type === "success" ? "Success" : 
                   notification.type === "danger" ? "Error" : "Warning"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setNotification({ show: false, message: "", type: "" })}></button>
              </div>
              <div className="modal-body text-center py-4">
                <p className="mb-0">{notification.message}</p>
              </div>
              <div className="modal-footer justify-content-center py-3">
                <button type="button" className="btn btn-primary" onClick={() => setNotification({ show: false, message: "", type: "" })}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeIndex;