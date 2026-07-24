import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from "recharts";

const API_BASE_URL = "http://localhost:8081/api/leave-management";

function LeaveManagement() {
  // State Management
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch leave records");
      }
      const data = await response.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentLeave, setCurrentLeave] = useState({
    employeeName: "",
    department: "",
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
    status: "Pending",
    appliedDate: "",
    approved: "0",
    pending: "1",
    rejected: "0",
    totalRequest: 1,
    totalDays: 0
  });

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Statistics
  const getStatistics = () => {
    const totalRequests = leaveRequests.length;
    const approved = leaveRequests.filter(l => l.status === "Approved").length;
    const pending = leaveRequests.filter(l => l.status === "Pending").length;
    const rejected = leaveRequests.filter(l => l.status === "Rejected").length;
    const cancelled = leaveRequests.filter(l => l.status === "Cancelled").length;
    
    const totalDays = leaveRequests.reduce((sum, l) => sum + l.totalDays, 0);
    const approvedDays = leaveRequests.filter(l => l.status === "Approved")
      .reduce((sum, l) => sum + l.totalDays, 0);

    // Department breakdown
    const deptStats = {};
    leaveRequests.forEach(l => {
      if (!deptStats[l.department]) {
        deptStats[l.department] = { total: 0, approved: 0, pending: 0, rejected: 0 };
      }
      deptStats[l.department].total++;
      if (l.status === "Approved") deptStats[l.department].approved++;
      if (l.status === "Pending") deptStats[l.department].pending++;
      if (l.status === "Rejected") deptStats[l.department].rejected++;
    });

    // Leave type breakdown
    const leaveTypeStats = {};
    leaveRequests.forEach(l => {
      if (!leaveTypeStats[l.leaveType]) {
        leaveTypeStats[l.leaveType] = { total: 0, approved: 0 };
      }
      leaveTypeStats[l.leaveType].total++;
      if (l.status === "Approved") leaveTypeStats[l.leaveType].approved++;
    });

    return {
      totalRequests,
      approved,
      pending,
      rejected,
      cancelled,
      totalDays,
      approvedDays,
      deptStats,
      leaveTypeStats,
      approvalRate: totalRequests > 0 ? Math.round((approved / totalRequests) * 100) : 0,
      pendingRate: totalRequests > 0 ? Math.round((pending / totalRequests) * 100) : 0
    };
  };

  const stats = getStatistics();

  // Filtered data
  const getFilteredData = () => {
    let filtered = leaveRequests;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    
    if (filter === "thisMonth") {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      filtered = filtered.filter(l => {
        const date = new Date(l.startDate);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    } else if (filter === "lastMonth") {
      const today = new Date();
      const month = today.getMonth() - 1;
      const year = today.getFullYear();
      filtered = filtered.filter(l => {
        const date = new Date(l.startDate);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    } else if (filter === "upcoming") {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(l => l.startDate >= today && l.status === "Pending");
    }
    
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalDays = calculateDays(currentLeave.startDate, currentLeave.endDate);
    const normalizedStatus = editingLeave ? currentLeave.status : "Pending";
    const payload = {
      employeeName: currentLeave.employeeName,
      department: currentLeave.department,
      leaveType: currentLeave.leaveType,
      startDate: currentLeave.startDate,
      endDate: currentLeave.endDate,
      totalDays,
      status: normalizedStatus,
      reason: currentLeave.reason,
      appliedDate: editingLeave ? currentLeave.appliedDate : new Date().toISOString().split('T')[0],
      approved: normalizedStatus === "Approved" ? "1" : "0",
      pending: normalizedStatus === "Pending" ? "1" : "0",
      rejected: normalizedStatus === "Rejected" ? "1" : "0",
      totalRequest: 1
    };

    try {
      const url = editingLeave ? `${API_BASE_URL}/${editingLeave.id}` : API_BASE_URL;
      const response = await fetch(url, {
        method: editingLeave ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || (editingLeave ? "Failed to update leave request" : "Failed to create leave request"));
      }

      const saved = await response.json();
      if (editingLeave) {
        setLeaveRequests(prev => prev.map(l => l.id === saved.id ? saved : l));
      } else {
        setLeaveRequests(prev => [...prev, saved]);
      }

      resetForm();
      setShowForm(false);
      setEditingLeave(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to save leave request");
    }
  };

  // Calculate days
  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Reset form
  const resetForm = () => {
    setCurrentLeave({
      employeeName: "",
      department: "",
      leaveType: "Annual",
      startDate: "",
      endDate: "",
      reason: "",
      status: "Pending",
      appliedDate: "",
      approved: "0",
      pending: "1",
      rejected: "0",
      totalRequest: 1,
      totalDays: 0
    });
  };

  // Handle edit
  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setCurrentLeave({
      employeeName: leave.employeeName,
      department: leave.department,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      status: leave.status || "Pending",
      appliedDate: leave.appliedDate || "",
      approved: leave.approved || "0",
      pending: leave.pending || "0",
      rejected: leave.rejected || "0",
      totalRequest: leave.totalRequest || 1,
      totalDays: leave.totalDays || 0
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete leave request");
      }

      setLeaveRequests(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Update status
  const updateStatus = async (id, newStatus) => {
    try {
      const leave = leaveRequests.find(l => l.id === id);
      if (!leave) {
        throw new Error("Leave request not found");
      }

      if (newStatus === "Approved") {
        const response = await fetch(`${API_BASE_URL}/${id}/approve?days=${leave.totalDays}`, {
          method: "POST"
        });
        if (!response.ok) {
          throw new Error("Failed to approve leave request");
        }
      } else if (newStatus === "Rejected") {
        const response = await fetch(`${API_BASE_URL}/${id}/reject`, {
          method: "POST"
        });
        if (!response.ok) {
          throw new Error("Failed to reject leave request");
        }
      }

      await fetchLeaveRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  // Chart data
  const statusChartData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected },
    { name: "Cancelled", value: stats.cancelled }
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'];

  const monthlyTrendData = [
    { month: 'Jan', leaves: 5 },
    { month: 'Feb', leaves: 8 },
    { month: 'Mar', leaves: 3 },
    { month: 'Apr', leaves: 6 },
    { month: 'May', leaves: 4 },
    { month: 'Jun', leaves: 7 }
  ];

  // Department chart data
  const deptChartData = Object.entries(stats.deptStats).map(([dept, data]) => ({
    name: dept,
    total: data.total,
    approved: data.approved,
    pending: data.pending,
    rejected: data.rejected
  }));

  // Styles
  const styles = {
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "2rem",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: "#f3f4f6",
      minHeight: "100vh"
    },
    header: {
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      marginBottom: "2rem"
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem"
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      marginTop: "1.5rem"
    },
    statCard: (bgColor) => ({
      backgroundColor: bgColor || "white",
      padding: "1.25rem",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      transition: "transform 0.2s",
      cursor: "pointer"
    }),
    statValue: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: "0.25rem 0 0.25rem 0"
    },
    statLabel: {
      fontSize: "0.875rem",
      color: "#6b7280",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    },
    filterSection: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: "1.5rem"
    },
    filterButton: (active) => ({
      padding: "0.5rem 1rem",
      backgroundColor: active ? "#3b82f6" : "white",
      color: active ? "white" : "#6b7280",
      border: active ? "none" : "1px solid #d1d5db",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "0.875rem",
      transition: "all 0.2s"
    }),
    searchInput: {
      padding: "0.5rem 1rem",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "0.875rem",
      marginLeft: "auto",
      minWidth: "200px"
    },
    chartContainer: {
      backgroundColor: "white",
      padding: "1.5rem",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      marginBottom: "1.5rem"
    },
    chartTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#1f2937",
      margin: "0 0 1rem 0"
    },
    chartGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1.5rem",
      marginBottom: "1.5rem"
    },
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      overflow: "auto",
      padding: "1rem"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "900px"
    },
    th: {
      textAlign: "left",
      padding: "0.75rem 1rem",
      backgroundColor: "#f9fafb",
      color: "#374151",
      fontWeight: "600",
      fontSize: "0.75rem",
      textTransform: "uppercase",
      borderBottom: "2px solid #e5e7eb"
    },
    td: {
      padding: "0.75rem 1rem",
      borderBottom: "1px solid #e5e7eb",
      fontSize: "0.875rem",
      color: "#1f2937"
    },
    badge: (status) => ({
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: status === "Approved" ? "#dcfce7" : 
                      status === "Pending" ? "#fef3c7" : 
                      status === "Rejected" ? "#fee2e2" : "#f3f4f6",
      color: status === "Approved" ? "#166534" : 
             status === "Pending" ? "#92400e" : 
             status === "Rejected" ? "#991b1b" : "#6b7280"
    }),
    statusButton: (bgColor) => ({
      padding: "0.25rem 0.75rem",
      backgroundColor: bgColor,
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "0.75rem",
      cursor: "pointer",
      marginRight: "0.25rem",
      transition: "all 0.2s"
    }),
    button: {
      padding: "0.5rem 1.5rem",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "0.875rem"
    },
    buttonDanger: {
      padding: "0.5rem 1.5rem",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "0.875rem"
    },
    formOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)"
    },
    formContainer: {
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "16px",
      maxWidth: "600px",
      width: "90%",
      maxHeight: "90vh",
      overflowY: "auto"
    },
    formGroup: {
      marginBottom: "1rem"
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "0.25rem"
    },
    input: {
      width: "100%",
      padding: "0.5rem 0.75rem",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "0.875rem",
      transition: "border 0.2s"
    },
    formActions: {
      display: "flex",
      gap: "0.75rem",
      justifyContent: "flex-end",
      marginTop: "1.5rem"
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      color: "#9ca3af"
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>
            <i className="bi bi-calendar-check" style={{ fontSize: "2rem", color: "#3b82f6" }}></i>
            Leave Management
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button style={styles.button} onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-lg"></i> New Leave Request
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard("#eff6ff")}>
            <p style={styles.statLabel}>
              <i className="bi bi-file-text" style={{ color: "#3b82f6" }}></i> Total Requests
            </p>
            <p style={styles.statValue}>{stats.totalRequests}</p>
          </div>
          <div style={styles.statCard("#f0fdf4")}>
            <p style={styles.statLabel}>
              <i className="bi bi-check-circle" style={{ color: "#10b981" }}></i> Approved
            </p>
            <p style={styles.statValue}>{stats.approved}</p>
          </div>
          <div style={styles.statCard("#fef3c7")}>
            <p style={styles.statLabel}>
              <i className="bi bi-clock" style={{ color: "#f59e0b" }}></i> Pending
            </p>
            <p style={styles.statValue}>{stats.pending}</p>
          </div>
          <div style={styles.statCard("#fee2e2")}>
            <p style={styles.statLabel}>
              <i className="bi bi-x-circle" style={{ color: "#ef4444" }}></i> Rejected
            </p>
            <p style={styles.statValue}>{stats.rejected}</p>
          </div>
          <div style={styles.statCard("#f3f4f6")}>
            <p style={styles.statLabel}>
              <i className="bi bi-calendar" style={{ color: "#6b7280" }}></i> Total Days
            </p>
            <p style={styles.statValue}>{stats.totalDays}</p>
          </div>
          <div style={styles.statCard("#ede9fe")}>
            <p style={styles.statLabel}>
              <i className="bi bi-graph-up" style={{ color: "#8b5cf6" }}></i> Approval Rate
            </p>
            <p style={styles.statValue}>{stats.approvalRate}%</p>
          </div>
        </div>

        {/* Filter Section */}
        <div style={styles.filterSection}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280", marginRight: "0.5rem" }}>Filter:</span>
          {[
            { key: "all", label: "All" },
            { key: "thisMonth", label: "This Month" },
            { key: "lastMonth", label: "Last Month" },
            { key: "upcoming", label: "Upcoming" }
          ].map((f) => (
            <button
              key={f.key}
              style={styles.filterButton(filter === f.key)}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <select
            style={{...styles.searchInput, minWidth: "120px"}}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search leaves..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartGrid}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Leave Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Monthly Leave Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leaves" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Chart */}
      {deptChartData.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Department Leave Statistics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="approved" fill="#10b981" name="Approved" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={styles.chartTitle}>Leave Requests</h3>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Showing {filteredData.length} of {leaveRequests.length} requests
          </span>
        </div>

        {filteredData.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="bi bi-inbox" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem", color: "#d1d5db" }}></i>
            <p>No leave requests found</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Leave Type</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>End Date</th>
                <th style={styles.th}>Days</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((leave) => (
                <tr key={leave.id}>
                  <td style={styles.td}>{leave.employeeName || "—"}</td>
                  <td style={styles.td}>{leave.department || "—"}</td>
                  <td style={styles.td}>{leave.leaveType || "—"}</td>
                  <td style={styles.td}>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : "—"}</td>
                  <td style={styles.td}>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : "—"}</td>
                  <td style={styles.td}>{leave.totalDays ?? "—"}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(leave.status)}>
                      {leave.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {leave.status === "Pending" && (
                      <>
                        <button
                          style={styles.statusButton("#10b981")}
                          onClick={() => updateStatus(leave.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          style={styles.statusButton("#ef4444")}
                          onClick={() => updateStatus(leave.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      style={{...styles.button, padding: "0.25rem 0.75rem", fontSize: "0.75rem", marginRight: "0.25rem"}}
                      onClick={() => handleEdit(leave)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      style={{...styles.buttonDanger, padding: "0.25rem 0.75rem", fontSize: "0.75rem"}}
                      onClick={() => handleDelete(leave.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={styles.formOverlay} onClick={() => {
          setShowForm(false);
          setEditingLeave(null);
          resetForm();
        }}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#1f2937" }}>
              {editingLeave ? "Edit Leave Request" : "New Leave Request"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.formGroup}>
                  <label htmlFor="employeeName" style={styles.label}>Employee Name *</label>
                  <input
                    id="employeeName"
                    type="text"
                    style={styles.input}
                    value={currentLeave.employeeName}
                    onChange={(e) => setCurrentLeave({...currentLeave, employeeName: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="department" style={styles.label}>Department *</label>
                  <input
                    id="department"
                    type="text"
                    style={styles.input}
                    value={currentLeave.department}
                    onChange={(e) => setCurrentLeave({...currentLeave, department: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="leaveType" style={styles.label}>Leave Type *</label>
                <select
                  id="leaveType"
                  style={styles.input}
                  value={currentLeave.leaveType}
                  onChange={(e) => setCurrentLeave({...currentLeave, leaveType: e.target.value})}
                  required
                >
                  <option value="Annual">Annual</option>
                  <option value="Sick">Sick</option>
                  <option value="Casual">Casual</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Paternity">Paternity</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.formGroup}>
                  <label htmlFor="startDate" style={styles.label}>Start Date *</label>
                  <input
                    id="startDate"
                    type="date"
                    style={styles.input}
                    value={currentLeave.startDate}
                    onChange={(e) => setCurrentLeave({...currentLeave, startDate: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="endDate" style={styles.label}>End Date *</label>
                  <input
                    id="endDate"
                    type="date"
                    style={styles.input}
                    value={currentLeave.endDate}
                    onChange={(e) => setCurrentLeave({...currentLeave, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="reason" style={styles.label}>Reason *</label>
                <textarea
                  id="reason"
                  style={{...styles.input, minHeight: "60px"}}
                  value={currentLeave.reason}
                  onChange={(e) => setCurrentLeave({...currentLeave, reason: e.target.value})}
                  placeholder="Please provide reason for leave"
                  required
                />
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={{...styles.button, backgroundColor: "#9ca3af"}}
                  onClick={() => {
                    setShowForm(false);
                    setEditingLeave(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.button}>
                  {editingLeave ? "Update" : "Submit"} Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global styles */}
      <style>{`
        .bi {
          font-family: "bootstrap-icons" !important;
        }
        select:focus, input:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        tr:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}

export default LeaveManagement;