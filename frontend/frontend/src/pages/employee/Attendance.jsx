import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";


function Attendance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [departments, setDepartments] = useState([]);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
    title: ""
  });

  // Statistics
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    total: 0,
    attendanceRate: 0
  });

  // Modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [checkInLocation, setCheckInLocation] = useState("");

  const API_BASE_URL = "http://localhost:8081/api";

  // Fetch data when date changes
  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [selectedDate]);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
      
      // Extract unique departments
      const depts = [...new Set(data.map(emp => emp.department).filter(Boolean))];
      setDepartments(depts);
    } catch (err) {
      console.error("Error fetching employees:", err);
      showNotification("Error", "Failed to load employees: " + err.message, "error");
    }
  };

  // Fetch attendance
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch attendance for selected date
      const response = await fetch(`${API_BASE_URL}/attendance?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const data = await response.json();
      setAttendance(data);
      
      // Calculate stats
      calculateStats(data);
    } catch (err) {
      setError(err.message);
      showNotification("Error", "Failed to load attendance: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    // Convert status to uppercase if needed (since backend uses UPPERCASE)
    const present = data.filter(a => a.status?.toUpperCase() === "PRESENT").length;
    const absent = data.filter(a => a.status?.toUpperCase() === "ABSENT").length;
    const late = data.filter(a => a.status?.toUpperCase() === "LATE").length;
    const onLeave = data.filter(a => a.status?.toUpperCase() === "ON_LEAVE").length;
    const total = data.length;

    setStats({
      present,
      absent,
      late,
      onLeave,
      total,
      attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0
    });
  };

  // Show notification
  const showNotification = (title, message, type = "success") => {
    setNotification({
      show: true,
      message: message,
      type: type,
      title: title
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Handle Check In
  const handleCheckIn = async (employeeId) => {
    try {
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId,
          checkIn: now,
          date: selectedDate,
          location: checkInLocation || "Office"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in");
      }
      
      showNotification("Success", "Check-in successful!", "success");
      await fetchAttendance(); // Refresh data
      setShowCheckInModal(false);
      setCheckInLocation("");
    } catch (err) {
      showNotification("Error", "Failed to check in: " + err.message, "error");
    }
  };

  // Handle Check Out
  const handleCheckOut = async (employeeId) => {
    try {
      const now = new Date().toISOString();
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId,
          checkOut: now,
          date: selectedDate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check out");
      }
      
      showNotification("Success", "Check-out successful!", "success");
      await fetchAttendance(); // Refresh data
      setShowCheckOutModal(false);
    } catch (err) {
      showNotification("Error", "Failed to check out: " + err.message, "error");
    }
  };

  // Handle Manual Status Update
  const handleManualStatusUpdate = async (employeeId, status) => {
    try {
      // Convert to uppercase for backend
      const statusValue = status.toUpperCase();
      const response = await fetch(`${API_BASE_URL}/attendance/${employeeId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          status: statusValue,
          reason: "Manual update"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      
      showNotification("Success", "Status updated successfully!", "success");
      await fetchAttendance(); // Refresh data
    } catch (err) {
      showNotification("Error", "Failed to update status: " + err.message, "error");
    }
  };

  // Filter attendance data
  const getFilteredAttendance = () => {
    let filtered = attendance;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(a => a.status?.toUpperCase() === filterStatus.toUpperCase());
    }

    // Filter by department
    if (filterDepartment !== "all") {
      filtered = filtered.filter(a => a.employee?.department === filterDepartment);
    }

    return filtered;
  };

  const filteredAttendance = getFilteredAttendance();

  // Loading state
  if (loading) {
    return (
      <div className="attendance-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  // Modal styles
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

  const modalStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
  };

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="attendance-header">
        <div className="header-content">
          <h1>
            <i className="bi bi-calendar-check"></i> Attendance Management
          </h1>
          <p>Track employee attendance, check-ins, and absences</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-export"
            onClick={() => navigate("/attendance-report")}
          >
            <i className="bi bi-file-earmark-pdf"></i> Export Report
          </button>
          <button 
            className="btn-refresh"
            onClick={fetchAttendance}
          >
            <i className="bi bi-arrow-repeat"></i> Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="attendance-stats">
        <div className="stat-card present">
          <div className="stat-icon">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Present</h3>
            <p className="stat-number">{stats.present}</p>
            <small>Today</small>
          </div>
        </div>

        <div className="stat-card absent">
          <div className="stat-icon">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Absent</h3>
            <p className="stat-number">{stats.absent}</p>
            <small>Today</small>
          </div>
        </div>

        <div className="stat-card late">
          <div className="stat-icon">
            <i className="bi bi-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Late</h3>
            <p className="stat-number">{stats.late}</p>
            <small>Today</small>
          </div>
        </div>

        <div className="stat-card leave">
          <div className="stat-icon">
            <i className="bi bi-calendar-plus"></i>
          </div>
          <div className="stat-content">
            <h3>On Leave</h3>
            <p className="stat-number">{stats.onLeave}</p>
            <small>Today</small>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="stat-icon">
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-content">
            <h3>Attendance Rate</h3>
            <p className="stat-number">{stats.attendanceRate.toFixed(1)}%</p>
            <small>Today</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <button
            className="btn-reset"
            onClick={() => {
              setFilterStatus("all");
              setFilterDepartment("all");
            }}
          >
            <i className="bi bi-arrow-clockwise"></i> Reset
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Attendance Table */}
      <div className="attendance-table-wrapper">
        <div className="table-header">
          <h3>Attendance List ({filteredAttendance.length})</h3>
        </div>

        {filteredAttendance.length > 0 ? (
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="employee-info">
                        <div className="avatar">
                          {record.employee?.firstName?.charAt(0)}
                          {record.employee?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="employee-name">
                            {record.employee?.firstName} {record.employee?.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{record.employee?.department || "N/A"}</td>
                    <td>{record.employee?.position || "N/A"}</td>
                    <td>
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "—"}
                    </td>
                    <td>
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "—"}
                    </td>
                    <td>
                      <span className={`status-badge status-${record.status?.toLowerCase()}`}>
                        {record.status?.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!record.checkIn && record.status?.toUpperCase() !== "ON_LEAVE" && (
                          <button
                            className="btn-check-in"
                            onClick={() => {
                              setSelectedEmployee(record.employee);
                              setShowCheckInModal(true);
                            }}
                            title="Check In"
                          >
                            <i className="bi bi-clock-in"></i>
                          </button>
                        )}
                        {record.checkIn && !record.checkOut && (
                          <button
                            className="btn-check-out"
                            onClick={() => {
                              setSelectedEmployee(record.employee);
                              setShowCheckOutModal(true);
                            }}
                            title="Check Out"
                          >
                            <i className="bi bi-clock-out"></i>
                          </button>
                        )}
                        <select
                          className="status-update"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleManualStatusUpdate(record.employee.id, e.target.value);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">Update Status</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="on_leave">On Leave</option>
                        </select>
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
            <p>No attendance records found for the selected criteria</p>
          </div>
        )}
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && selectedEmployee && (
        <div style={modalOverlayStyle} onClick={() => setShowCheckInModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-clock-in"></i> Check In
              </h3>
              <button className="close-modal" onClick={() => setShowCheckInModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Confirm check-in for <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong></p>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={checkInLocation}
                  onChange={(e) => setCheckInLocation(e.target.value)}
                  className="form-control"
                />
              </div>
              <p className="text-muted small">
                <i className="bi bi-info-circle"></i> Time: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCheckInModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => handleCheckIn(selectedEmployee.id)}>
                <i className="bi bi-check-lg"></i> Confirm Check In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-Out Modal */}
      {showCheckOutModal && selectedEmployee && (
        <div style={modalOverlayStyle} onClick={() => setShowCheckOutModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-clock-out"></i> Check Out
              </h3>
              <button className="close-modal" onClick={() => setShowCheckOutModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Confirm check-out for <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong></p>
              <p className="text-muted small">
                <i className="bi bi-info-circle"></i> Time: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCheckOutModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => handleCheckOut(selectedEmployee.id)}>
                <i className="bi bi-check-lg"></i> Confirm Check Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div style={modalOverlayStyle} onClick={() => setNotification({ ...notification, show: false })}>
          <div style={{ ...modalStyle, maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px", textAlign: "center" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: notification.type === "success" ? "#d1fae5" : "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <i className={notification.type === "success" ? "bi bi-check-circle-fill" : "bi bi-exclamation-triangle-fill"} style={{
                  fontSize: "32px",
                  color: notification.type === "success" ? "#10b981" : "#ef4444"
                }}></i>
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                {notification.title}
              </h3>
              <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                {notification.message}
              </p>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                style={{
                  marginTop: "20px",
                  padding: "8px 24px",
                  backgroundColor: notification.type === "success" ? "#10b981" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;