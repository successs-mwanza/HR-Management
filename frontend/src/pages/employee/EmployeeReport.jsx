import { useState, useEffect, useCallback } from "react";
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

  // Filter states
  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/employees/${employeeId}`);
      if (!response.ok) throw new Error("Failed to fetch employee details");
      const data = await response.json();
      setEmployee(data);
    } catch (err) {
      setError(err.message);
    }
  }, [employeeId]);

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

  const fetchEmployeeAttendance = useCallback(async (start, end) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8081/api/attendance/employee/${employeeId}?startDate=${start}&endDate=${end}`
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
  }, [employeeId]);

  const applyFilter = useCallback(() => {
    let start = "";
    let end = "";

    if (filterType === "day") {
      const today = new Date();
      start = today.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (filterType === "week") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      start = startDate.toISOString().split('T')[0];
      end = endDate.toISOString().split('T')[0];
    } else if (filterType === "month") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      start = startDate.toISOString().split('T')[0];
      end = endDate.toISOString().split('T')[0];
    } else if (filterType === "year") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      start = startDate.toISOString().split('T')[0];
      end = endDate.toISOString().split('T')[0];
    } else if (filterType === "custom") {
      if (customStartDate && customEndDate) {
        start = customStartDate;
        end = customEndDate;
      } else {
        return;
      }
    }

    setStartDate(start);
    setEndDate(end);
    fetchEmployeeAttendance(start, end);
  }, [customEndDate, customStartDate, fetchEmployeeAttendance, filterType]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
      applyFilter();
    }
  }, [employeeId, fetchEmployeeDetails, applyFilter]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (type === "custom") {
      if (!customStartDate) {
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        setCustomStartDate(monthAgo.toISOString().split('T')[0]);
        setCustomEndDate(today.toISOString().split('T')[0]);
      }
    }
  };

  const handleCustomFilterApply = () => {
    if (customStartDate && customEndDate) {
      fetchEmployeeAttendance(customStartDate, customEndDate);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // UPDATED: Better status badge styles with black text
  const getStatusBadgeStyle = (status) => {
    if (!status) return { backgroundColor: "#e9ecef", color: "#333333" };
    const upperStatus = status.toUpperCase();
    if (upperStatus === "PRESENT") {
      return { backgroundColor: "#d4edda", color: "#36b654", border: "1px solid #c3e6cb" };
    }
    if (upperStatus === "ABSENT") {
      return { backgroundColor: "#f8d7da", color: "#b41625", border: "1px solid #f5c6cb" };
    }
    if (upperStatus === "LATE") {
      return { backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba" };
    }
    if (upperStatus === "ON_LEAVE") {
      return { backgroundColor: "#d1ecf1", color: "#0c5460", border: "1px solid #bee5eb" };
    }
    return { backgroundColor: "#e9ecef", color: "#333333" };
  };

  const getStatusIcon = (status) => {
    if (!status) return "bi-question-circle";
    const upperStatus = status.toUpperCase();
    if (upperStatus === "PRESENT") return "bi-check-circle-fill";
    if (upperStatus === "ABSENT") return "bi-x-circle-fill";
    if (upperStatus === "LATE") return "bi-clock-fill";
    if (upperStatus === "ON_LEAVE") return "bi-calendar-plus-fill";
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

  const getFilterLabel = () => {
    switch(filterType) {
      case "day": return "Today";
      case "week": return "Last 7 Days";
      case "month": return "Last 30 Days";
      case "year": return "Last Year";
      case "custom": return "Custom Range";
      default: return "Custom";
    }
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
    <div className="container-fluid py-4 employee-report-page">
      <div className="page-hero mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
          <div className="d-flex align-items-start gap-3">
            <div className="hero-icon"><i className="bi bi-file-earmark-person-fill"></i></div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="hero-badge"><i className="bi bi-shield-check"></i></span>
                <span className="text-muted fw-semibold small">Attendance overview</span>
              </div>
              <h4 className="fw-bold mb-1">Employee attendance report</h4>
              <p className="text-muted mb-0">Review attendance patterns with a clear and friendly overview.</p>
            </div>
          </div>
          <button 
            className="btn btn-outline-secondary btn-pill"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Employees
          </button>
        </div>
      </div>

      <div className="card shadow-sm mb-4 report-profile-card">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-2 text-center">
              <div className="avatar-large" style={{
                width: "100px",
                height: "100px",
                background: "linear-gradient(135deg, #4a4a6a 0%, #2d2d44 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontSize: "40px",
                fontWeight: "bold",
                color: "white",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)"
              }}>
                {getInitials(employee.firstName, employee.lastName)}
              </div>
            </div>
            <div className="col-md-10">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
                    {employee.firstName} {employee.middleName} {employee.lastName}
                  </h4>
                  <p className="mb-2" style={{ color: "#555555" }}>
                    <i className="bi bi-briefcase me-1" style={{ color: "#666666" }}></i> {employee.position || "No position"}
                  </p>
                  <p className="mb-0" style={{ color: "#555555" }}>
                    <i className="bi bi-building me-1" style={{ color: "#666666" }}></i> {employee.department || "No department"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1" style={{ color: "#333333" }}>
                    <i className="bi bi-envelope me-1" style={{ color: "#666666" }}></i> {employee.email || "No email"}
                  </p>
                  <p className="mb-1" style={{ color: "#333333" }}>
                    <i className="bi bi-telephone me-1" style={{ color: "#666666" }}></i> {employee.phone || "No phone"}
                  </p>
                  <p className="mb-0">
                    <span className={`badge ${employee.status === "Inactive" ? "bg-danger" : "bg-success"} px-3 py-2`}>
                      
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 filter-panel">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: "#333333" }}>Filter By</label>
              <select 
                className="form-select" 
                value={filterType} 
                onChange={(e) => handleFilterChange(e.target.value)}
                style={{ color: "#333333", backgroundColor: "#ffffff", borderColor: "#cccccc" }}
              >
                <option value="day">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {filterType === "custom" && (
              <>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ color: "#333333" }}>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{ color: "#333333", backgroundColor: "#ffffff", borderColor: "#cccccc" }}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ color: "#333333" }}>End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{ color: "#333333", backgroundColor: "#ffffff", borderColor: "#cccccc" }}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={handleCustomFilterApply}
                    style={{ backgroundColor: "#4a4a6a", borderColor: "#4a4a6a" }}
                  >
                    <i className="bi bi-search me-1"></i> Apply Custom Filter
                  </button>
                </div>
              </>
            )}

            {filterType !== "custom" && (
              <div className="col-md-3 d-flex align-items-end">
                <button 
                  className="btn btn-primary w-100"
                  onClick={applyFilter}
                  style={{ backgroundColor: "#4a4a6a", borderColor: "#4a4a6a" }}
                >
                  <i className="bi bi-search me-1"></i> Apply {getFilterLabel()}
                </button>
              </div>
            )}
          </div>

          {/* Show current filter info */}
          <div className="mt-3 pt-2 border-top" style={{ borderColor: "#e0e0e0 !important" }}>
            <div className="d-flex flex-wrap gap-3">
              <span className="badge py-2 px-3" style={{ backgroundColor: "#4a4a6a", color: "#ffffff" }}>
                <i className="bi bi-calendar-range me-1"></i> 
                {filterType === "day" ? "Today" :
                 filterType === "week" ? "Last 7 Days" :
                 filterType === "month" ? "Last 30 Days" :
                 filterType === "year" ? "Last Year" :
                 "Custom Range"}
              </span>
              <span className="badge py-2 px-3" style={{ backgroundColor: "#6c6c8a", color: "#ffffff" }}>
                <i className="bi bi-calendar-start me-1"></i> 
                From: {formatDate(startDate)}
              </span>
              <span className="badge py-2 px-3" style={{ backgroundColor: "#6c6c8a", color: "#ffffff" }}>
                <i className="bi bi-calendar-end me-1"></i> 
                To: {formatDate(endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="card shadow-sm report-stat-card report-stat-card-dark">
            <div className="card-body text-center">
              <h6>Total Days</h6>
              <h3 className="mb-0">{stats.totalDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm report-stat-card report-stat-card-success">
            <div className="card-body text-center">
              <h6>Present</h6>
              <h3 className="mb-0">{stats.presentDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm report-stat-card report-stat-card-danger">
            <div className="card-body text-center">
              <h6>Absent</h6>
              <h3 className="mb-0">{stats.absentDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm report-stat-card report-stat-card-warning">
            <div className="card-body text-center">
              <h6>Late</h6>
              <h3 className="mb-0">{stats.lateDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm report-stat-card report-stat-card-info">
            <div className="card-body text-center">
              <h6>On Leave</h6>
              <h3 className="mb-0">{stats.leaveDays}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card shadow-sm report-stat-card report-stat-card-dark">
            <div className="card-body text-center">
              <h6>Attendance Rate</h6>
              <h3 className="mb-0">{stats.attendanceRate.toFixed(1)}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm report-table-card">
        <div className="card-header" style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold" style={{ color: "#1a1a2e" }}>
              <i className="bi bi-table me-2 text-primary"></i>
              Attendance Records ({getFilterLabel()})
            </h5>
            <span className="badge" style={{ backgroundColor: "#e9ecef", color: "#333333" }}>
              {attendance.length} records found
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 d-block mb-2" style={{ color: "#999999" }}></i>
              <p style={{ color: "#666666" }}>No attendance records found for {getFilterLabel().toLowerCase()}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th style={{ color: "#333333", fontWeight: "600" }}>#</th>
                    <th style={{ color: "#333333", fontWeight: "600" }}>Date</th>
                    <th style={{ color: "#333333", fontWeight: "600" }}>Status</th>
                    <th style={{ color: "#333333", fontWeight: "600" }}>Check In</th>
                    <th style={{ color: "#333333", fontWeight: "600" }}>Check Out</th>
                    <th style={{ color: "#333333", fontWeight: "600" }}>Location</th>
                    <th style={{ color: "#333333", fontWeight: "600" }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => {
                    const statusStyle = getStatusBadgeStyle(record.status);
                    return (
                      <tr key={record.id || index}>
                        <td style={{ color: "#333333" }}>{index + 1}</td>
                        <td style={{ color: "#333333" }}>
                          <strong>{formatDate(record.date)}</strong>
                        </td>
                        <td>
                          <span className="badge px-3 py-2" style={statusStyle}>
                            <i className={`bi ${getStatusIcon(record.status)} me-1`}></i>
                            {record.status || "N/A"}
                          </span>
                        </td>
                        <td style={{ color: "#333333" }}>
                          {record.checkIn ? formatTime(record.checkIn) : "-"}
                        </td>
                        <td style={{ color: "#333333" }}>
                          {record.checkOut ? formatTime(record.checkOut) : "-"}
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: "#f0f0f0", color: "#333333" }}>
                            <i className="bi bi-geo-alt me-1"></i>
                            {record.checkInLocation || record.location || "N/A"}
                          </span>
                        </td>
                        <td style={{ color: "#333333" }}>
                          {record.reason || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer" style={{ backgroundColor: "#f8f9fa", borderTop: "1px solid #e0e0e0" }}>
          <div className="d-flex justify-content-between align-items-center">
            <span style={{ color: "#666666", fontSize: "14px" }}>
              Showing {attendance.length} records from {formatDate(startDate)} to {formatDate(endDate)}
            </span>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm" 
                style={{ backgroundColor: "#28a745", color: "#ffffff", border: "none" }}
                onClick={() => {
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
                style={{ backgroundColor: "#4a4a6a", borderColor: "#4a4a6a" }}
              >
                <i className="bi bi-printer me-1"></i> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeReport;