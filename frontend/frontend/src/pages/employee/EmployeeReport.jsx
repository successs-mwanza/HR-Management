import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

function EmployeeReport() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 0,
    attendanceRate: 0
  });

  // Date range filter
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
      fetchEmployeeAttendance();
    }
  }, [employeeId, startDate, endDate]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/employees/${employeeId}`);// getting the employee full report.
      if (!response.ok) throw new Error("Failed to fetch employee details");
      const data = await response.json();
      setEmployee(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8081/api/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const data = await response.json();
      setAttendance(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalDays = data.length;
    const presentDays = data.filter(a => a.status?.toUpperCase() === "PRESENT").length;
    const absentDays = data.filter(a => a.status?.toUpperCase() === "ABSENT").length;
    const lateDays = data.filter(a => a.status?.toUpperCase() === "LATE").length;
    const leaveDays = data.filter(a => a.status?.toUpperCase() === "ON_LEAVE").length;
    
    setStats({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      attendanceRate: totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "secondary";
    const upperStatus = status.toUpperCase();
    if (upperStatus === "PRESENT") return "success";
    if (upperStatus === "ABSENT") return "danger";
    if (upperStatus === "LATE") return "warning";
    if (upperStatus === "ON_LEAVE") return "info";
    return "secondary";
  };

  const getStatusIcon = (status) => {
    if (!status) return "bi-question-circle";
    const upperStatus = status.toUpperCase();
    if (upperStatus === "PRESENT") return "bi-check-circle";
    if (upperStatus === "ABSENT") return "bi-x-circle";
    if (upperStatus === "LATE") return "bi-clock";
    if (upperStatus === "ON_LEAVE") return "bi-calendar-plus";
    return "bi-question-circle";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateRangeChange = () => {
    fetchEmployeeAttendance();
  };

  if (loading && !employee) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading employee report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Employee not found
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header with Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Employees
        </button>
        <h4 className="mb-0 fw-bold">
          <i className="bi bi-file-earmark-person text-primary me-2"></i>
          Employee Attendance Report
        </h4>
        <div></div>
      </div>

      {/* Employee Profile Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-2 text-center">
              <div className="avatar-large" style={{
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
                {getInitials(employee.firstName, employee.lastName)}
              </div>
            </div>
            <div className="col-md-10">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="fw-bold mb-1" style={{ color: "#000000" }}>
                    {employee.firstName} {employee.middleName} {employee.lastName}
                  </h4>
                  <p className="text-muted mb-2">
                    <i className="bi bi-briefcase me-1"></i> {employee.position || "No position"}
                  </p>
                  <p className="text-muted mb-0">
                    <i className="bi bi-building me-1"></i> {employee.department || "No department"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1" style={{ color: "#000000" }}>
                    <i className="bi bi-envelope me-1"></i> {employee.email || "No email"}
                  </p>
                  <p className="mb-1" style={{ color: "#000000" }}>
                    <i className="bi bi-telephone me-1"></i> {employee.phone || "No phone"}
                  </p>
                  <p className="mb-0">
                    <span className={`badge ${employee.status === "Inactive" ? "bg-danger" : "bg-success"} px-3 py-2`}>
                      {employee.status || "Active"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ color: "#000000" }}>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ color: "#000000" }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ color: "#000000" }}>End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ color: "#000000" }}
              />
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-primary w-100"
                onClick={handleDateRangeChange}
              >
                <i className="bi bi-search me-1"></i> Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body text-center">
              <h6>Total Days</h6>
              <h3 className="mb-0">{stats.totalDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body text-center">
              <h6>Present</h6>
              <h3 className="mb-0">{stats.presentDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-danger text-white shadow-sm">
            <div className="card-body text-center">
              <h6>Absent</h6>
              <h3 className="mb-0">{stats.absentDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white shadow-sm">
            <div className="card-body text-center">
              <h6>Late</h6>
              <h3 className="mb-0">{stats.lateDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-info text-white shadow-sm">
            <div className="card-body text-center">
              <h6>On Leave</h6>
              <h3 className="mb-0">{stats.leaveDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-dark text-white shadow-sm">
            <div className="card-body text-center">
              <h6>Attendance Rate</h6>
              <h3 className="mb-0">{stats.attendanceRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold" style={{ color: "#000000" }}>
            <i className="bi bi-table me-2 text-primary"></i>
            Attendance Records
          </h5>
          <span className="badge bg-light text-dark">
            {attendance.length} records found
          </span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              No attendance records found for this period
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ color: "#000000" }}>#</th>
                    <th style={{ color: "#000000" }}>Date</th>
                    <th style={{ color: "#000000" }}>Status</th>
                    <th style={{ color: "#000000" }}>Check In</th>
                    <th style={{ color: "#000000" }}>Check Out</th>
                    <th style={{ color: "#000000" }}>Location</th>
                    <th style={{ color: "#000000" }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={record.id || index}>
                      <td style={{ color: "#000000" }}>{index + 1}</td>
                      <td style={{ color: "#000000" }}>
                        <strong>{formatDate(record.date)}</strong>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeClass(record.status)} px-3 py-2`}>
                          <i className={`bi ${getStatusIcon(record.status)} me-1`}></i>
                          {record.status || "N/A"}
                        </span>
                      </td>
                      <td style={{ color: "#000000" }}>
                        {record.checkIn ? formatTime(record.checkIn) : "-"}
                      </td>
                      <td style={{ color: "#000000" }}>
                        {record.checkOut ? formatTime(record.checkOut) : "-"}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          <i className="bi bi-geo-alt me-1"></i>
                          {record.checkInLocation || record.location || "N/A"}
                        </span>
                      </td>
                      <td style={{ color: "#000000" }}>
                        {record.reason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            Showing {attendance.length} records from {formatDate(startDate)} to {formatDate(endDate)}
          </span>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-success"
              onClick={() => {
                // Export to CSV
                let csv = "Date,Status,Check In,Check Out,Location,Reason\n";
                attendance.forEach(record => {
                  csv += `${formatDate(record.date)},${record.status || "N/A"},${record.checkIn ? formatTime(record.checkIn) : "-"},${record.checkOut ? formatTime(record.checkOut) : "-"},${record.checkInLocation || record.location || "N/A"},${record.reason || "-"}\n`;
                });
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${employee.firstName}_${employee.lastName}_attendance.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              <i className="bi bi-download me-1"></i> Export CSV
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-1"></i> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeReport;