import { useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function EmployeeIndex() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

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

  useEffect(() => {
    fetch("http://localhost:8080/api/employees")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.data || data.content || [];

        setEmployees(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Auto-hide notification after 2 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDelete = async () => {
    const id = deleteConfirm.id;
    try {
      await fetch(`http://localhost:8080/api/employees/${id}`, {
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
      const response = await fetch("http://localhost:8080/api/employees", {
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
      const response = await fetch(`http://localhost:8080/api/employees/${editFormData.id}`, {
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
    setEditFormData({
      id: employee.id,
      firstName: employee.firstName || "",
      middleName: employee.middleName || "",
      lastName: employee.lastName || "",
      // department: employee.department || "",
      // position: employee.position || "",
      // email: employee.email || "",
      // phone: employee.phone || "",
      status: employee.status || "Active"
    });
    setShowEditModal(true);
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

  // Monthly recruitment (based on hireDate)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRecruitment = employees.filter((e) => {
    if (!e.hireDate) return false;
    const date = new Date(e.hireDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  return (
    
    <div className="container mt-4">

      <div className="row mb-3">
        {/* Total Employees */}
        <div className="col-md-3">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body text-center">
              <h6>Total Employees</h6>
              <h3>{employees.length}</h3>
            </div>
          </div>
        </div>

        {/* Active Employees */}
        <div className="col-md-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body text-center">
              <h6>Active Employees</h6>
              <h3>{activeCount}</h3>
            </div>
          </div>
        </div>

        {/* Inactive Employees */}
        <div className="col-md-3">
          <div className="card text-white bg-danger shadow-sm">
            <div className="card-body text-center">
              <h6>Inactive Employees</h6>
              <h3>{inactiveCount}</h3>
            </div>
          </div>
        </div>

        {/* Monthly Recruitment */}
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
      <div className="card shadow-sm">

        <div className="card-header d-flex justify-content-between align-items-center">
          
          <button
            className="btn btn-primary btn"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Employee
          </button>

          {/* SEARCH */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light border"
              onClick={() => setOpenSearch(!openSearch)}
            >
              <i className="bi bi-search"></i>
            </button>

            {openSearch && (
              <input
                autoFocus
                type="text"
                className="form-control form-control-sm"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "200px" }}
              />
            )}
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
              {paginated.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    {emp.firstName} {emp.middleName} {emp.lastName}
                  </td>
                  <td>{emp.department || "N/A"}</td>
                  <td>{emp.position || "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        emp.status === "Inactive"
                          ? "bg-danger"
                          : "bg-success"
                      }`}
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        color: "#fff"
                      }}
                    >
                      {emp.status || "Active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => openEditModal(emp)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm({ show: true, id: emp.id })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="card-footer d-flex justify-content-between">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="middleName" className="form-label">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        placeholder="Enter middle name"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="position" className="form-label">
                        Position
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="Enter position"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddEmployee}
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editFirstName" className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editFirstName"
                        name="firstName"
                        value={editFormData.firstName}
                        onChange={handleEditInputChange}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">2
                    
                      <label htmlFor="editMiddleName" className="form-label">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editMiddleName"
                        name="middleName"
                        value={editFormData.middleName}
                        onChange={handleEditInputChange}
                        placeholder="Enter middle name"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editLastName" className="form-label">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editLastName"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleEditInputChange}
                        placeholder="Enter last name"
                      />
                    </div>
                    {/* <div className="col-md-6 mb-3">
                      <label htmlFor="editDepartment" className="form-label">
                        Department
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editDepartment"
                        name="department"
                        value={editFormData.department}
                        onChange={handleEditInputChange}
                        placeholder="Enter department"
                      />
                    </div> */}
{/*                   

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editPosition" className="form-label">
                        Position
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editPosition"
                        name="position"
                        value={editFormData.position}
                        onChange={handleEditInputChange}
                        placeholder="Enter position"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editEmail" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="editEmail"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editPhone" className="form-label">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="editPhone"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditInputChange}
                        placeholder="Enter phone number"
                      />
                    </div> */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editStatus" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="editStatus"
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditEmployee}
                >
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this employee?</p>
                <p className="text-danger mb-0">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      {notification.show && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className={`modal-header bg-${notification.type} text-white`}>
                <h5 className="modal-title">
                  {notification.type === "success" && <i className="bi bi-check-circle-fill me-2"></i>}
                  {notification.type === "danger" && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                  {notification.type === "warning" && <i className="bi bi-exclamation-circle-fill me-2"></i>}
                  {notification.type === "success" ? "Success" : 
                   notification.type === "danger" ? "Error" : 
                   "Warning"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setNotification({ show: false, message: "", type: "" })}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <p className="mb-0">{notification.message}</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setNotification({ show: false, message: "", type: "" })}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeIndex;