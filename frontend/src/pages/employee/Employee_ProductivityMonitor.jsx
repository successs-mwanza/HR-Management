import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from "recharts";
import { 
  Calendar, Clock, CheckCircle, TrendingUp, Award, 
  AlertCircle, Users, Target, Zap 
} from "lucide-react";


function EmployeeProductivityMonitoring() {
  const location = useLocation();
  const selectedEmployeeName = location.state?.employeeName;
  const selectedEmployeeId = location.state?.employeeId;

  // State Management
  const [productivityData, setProductivityData] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    employeeId: selectedEmployeeId || "",
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 0,
    goalsAssigned: 0,
    goalsCompleted: 0,
    qualityScore: 0,
    notes: "",
    productivityRate: 0,
    timeSpent: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("week");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081/api"; //API entry point 

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchProductivityData();
    }
  }, [selectedEmployeeId]);

  const fetchProductivityData = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Fetching all productivity data...");
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const allData = await response.json();
      console.log("All data from backend:", allData);
      
      // Filter data for the specific employee
      const employeeData = allData.filter(item => 
        item.employeeId && String(item.employeeId) === String(selectedEmployeeId)
      );
      
      console.log(`Filtered data for employee ${selectedEmployeeId}:`, employeeData);
      setProductivityData(employeeData || []);
      
      if (employeeData.length === 0) {
        setError(`ℹ️ No productivity data found for ${selectedEmployeeName || 'this employee'}. You can add new entries.`);
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error fetching productivity data:", err);
      setError(`⚠️ Could not connect to the server. Please ensure the backend is running on ${API_BASE_URL}`);
      setProductivityData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        totalHours: 0,
        totalGoalsAssigned: 0,
        totalGoalsCompleted: 0,
        averageQuality: 0,
        completionRate: 0,
        efficiency: 0
      };
    }

    const totalHours = filteredData.reduce((sum, d) => sum + (d.hoursWorked || 0), 0);
    const totalGoalsAssigned = filteredData.reduce((sum, d) => sum + (d.goalsAssigned || 0), 0);
    const totalGoalsCompleted = filteredData.reduce((sum, d) => sum + (d.goalsCompleted || 0), 0);
    const averageQuality = Math.round(filteredData.reduce((sum, d) => sum + (d.qualityScore || 0), 0) / filteredData.length);
    const completionRate = totalGoalsAssigned > 0 ? Math.round((totalGoalsCompleted / totalGoalsAssigned) * 100) : 0;
    const efficiency = totalHours > 0 ? Math.round((totalGoalsCompleted / totalHours) * 10) / 10 : 0;

    return {
      totalHours,
      totalGoalsAssigned,
      totalGoalsCompleted,
      averageQuality,
      completionRate,
      efficiency
    };
  };

  const getFilteredData = () => {
    const today = new Date();
    let startDate = new Date();
    
    switch(filter) {
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    const startStr = startDate.toISOString().split('T')[0];
    return productivityData.filter(d => d.date >= startStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      setError("No employee selected. Please select an employee first.");
      return;
    }

    if (!currentEntry.date) {
      setError(" Please select a date.");
      return;
    }

    // Calculate productivity rate
    const productivityRate = currentEntry.goalsAssigned > 0 
      ? Math.round((currentEntry.goalsCompleted / currentEntry.goalsAssigned) * 100) 
      : 0;
    
    const timeSpent = Math.round((currentEntry.hoursWorked || 0) * 60);

    // Prepare the payload matching your backend entity
    const payload = {
      employeeId: selectedEmployeeId,
      employeeName: selectedEmployeeName || "",
      date: currentEntry.date,
      hoursWorked: Number(currentEntry.hoursWorked) || 0,
      goalsAssigned: Number(currentEntry.goalsAssigned) || 0,
      goalsCompleted: Number(currentEntry.goalsCompleted) || 0,
      qualityScore: Number(currentEntry.qualityScore) || 0,
      notes: currentEntry.notes || "",
      productivityRate: productivityRate,
      timeSpent: timeSpent
    };

    console.log("Sending payload:", payload);

    try {
      setLoading(true);
      setError("");

      let response;
      let url = API_BASE_URL;
      let method = "POST";

      if (editingEntry) {
        url = `${API_BASE_URL}/${editingEntry.id}`;
        method = "PUT";
      }

      response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      const savedEntry = await response.json();
      console.log("Saved entry:", savedEntry);
      
      if (editingEntry) {
        setProductivityData(prev => prev.map(entry => 
          entry.id === editingEntry.id ? savedEntry : entry
        ));
      } else {
        setProductivityData(prev => [...prev, savedEntry]);
      }

      resetForm();
      setShowForm(false);
      setEditingEntry(null);
      setError(" Entry saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.error("Error saving productivity entry:", err);
      setError(`Could not save the productivity entry. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentEntry({
      employeeId: selectedEmployeeId || "",
      date: new Date().toISOString().split('T')[0],
      hoursWorked: 0,
      goalsAssigned: 0,
      goalsCompleted: 0,
      qualityScore: 0,
      notes: "",
      productivityRate: 0,
      timeSpent: 0
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry({
      ...entry,
      employeeId: selectedEmployeeId
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/${id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      setProductivityData(prev => prev.filter(entry => entry.id !== id));
      setError(" Entry deleted successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError(` Could not delete the productivity entry. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Export data as CSV
  const exportCSV = () => {
    if (productivityData.length === 0) {
      setError("No data to export.");
      return;
    }

    const headers = ["Date", "Hours Worked", "Goals Assigned", "Goals Completed", "Quality Score", "Productivity Rate"];
    const rows = productivityData.map(d => [
      d.date,
      d.hoursWorked || 0,
      d.goalsAssigned || 0,
      d.goalsCompleted || 0,
      d.qualityScore || 0,
      d.productivityRate || 0
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity_data_${selectedEmployeeName || 'employee'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const chartData = getFilteredData().map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString()
  }));

  const stats = getStatistics();

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
    employeeInfo: {
      fontSize: "1rem",
      color: "#6b7280",
      marginTop: "0.5rem"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1rem",
      marginTop: "1.5rem"
    },
    statCard: (bgColor) => ({
      backgroundColor: bgColor || "white",
      padding: "1.25rem",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      transition: "transform 0.2s, box-shadow 0.2s"
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
    filterSection: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
      flexWrap: "wrap"
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
      minWidth: "700px"
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
    badge: (type) => ({
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: type === "completed" ? "#dcfce7" : 
                      type === "inProgress" ? "#fef3c7" : 
                      type === "review" ? "#ede9fe" : "#fee2e2",
      color: type === "completed" ? "#166534" : 
             type === "inProgress" ? "#92400e" : 
             type === "review" ? "#5b21b6" : "#991b1b"
    }),
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
      fontSize: "0.875rem",
      marginLeft: "0.5rem"
    },
    buttonSecondary: {
      padding: "0.5rem 1.5rem",
      backgroundColor: "#9ca3af",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "0.875rem"
    },
    retryButton: {
      padding: "0.5rem 1.5rem",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "0.875rem",
      marginLeft: "0.5rem"
    }
  };

  if (!selectedEmployeeId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <TrendingUp size={32} color="#3b82f6" />
            Productivity Monitor
          </h1>
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            <AlertCircle size={48} style={{ marginBottom: "1rem" }} />
            <h3>No Employee Selected</h3>
            <p>Please select an employee from the employee list to view their productivity.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>
              <TrendingUp size={32} color="#3b82f6" />
              Productivity Monitor
            </h1>
            {selectedEmployeeName && (
              <p style={styles.employeeInfo}>
                <Users size={16} style={{ marginRight: "0.5rem" }} />
                Employee: {selectedEmployeeName} (ID: {selectedEmployeeId})
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button style={styles.button} onClick={() => setShowForm(true)}>
               Add Entry
            </button>
            <button style={{...styles.button, backgroundColor: "#10b981"}} onClick={exportCSV}>
               Export CSV
            </button>
            <button style={styles.retryButton} onClick={fetchProductivityData}>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            marginTop: "1rem", 
            padding: "0.75rem 1rem", 
            backgroundColor: error.includes("") ? "#f0fdf4" : 
                            error.includes("ℹ") ? "#fef3c7" : "#fef2f2",
            color: error.includes("") ? "#166534" :
                   error.includes("ℹ") ? "#92400e" : "#b91c1c",
            borderRadius: "8px", 
            fontSize: "0.9rem",
            border: error.includes("") ? "1px solid #bbf7d0" : "none"
          }}>
            {error}
          </div>
        )}

        <div style={styles.statsGrid}>
          <div style={styles.statCard("#eff6ff")}>
            <p style={styles.statLabel}>
              <Clock size={16} color="#3b82f6" /> Total Hours
            </p>
            <p style={styles.statValue}>{stats.totalHours}h</p>
          </div>
          <div style={styles.statCard("#f0fdf4")}>
            <p style={styles.statLabel}>
              <Target size={16} color="#10b981" /> Goals Completed
            </p>
            <p style={styles.statValue}>{stats.totalGoalsCompleted}/{stats.totalGoalsAssigned}</p>
          </div>
          <div style={styles.statCard("#fef3c7")}>
            <p style={styles.statLabel}>
              <Award size={16} color="#f59e0b" /> Quality Score
            </p>
            <p style={styles.statValue}>{stats.averageQuality}%</p>
          </div>
          <div style={styles.statCard("#ede9fe")}>
            <p style={styles.statLabel}>
              <Zap size={16} color="#8b5cf6" /> Efficiency
            </p>
            <p style={styles.statValue}>{stats.efficiency} goals/h</p>
          </div>
          <div style={styles.statCard("#fce4ec")}>
            <p style={styles.statLabel}>
              <CheckCircle size={16} color="#ef4444" /> Completion Rate
            </p>
            <p style={styles.statValue}>{stats.completionRate}%</p>
          </div>
        </div>

        <div style={{ ...styles.filterSection, marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280", marginRight: "0.5rem" }}>Filter:</span>
          {["week", "month", "year"].map((f) => (
            <button
              key={f}
              style={styles.filterButton(filter === f)}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "1rem" }}>
             {productivityData.length} total entries
          </span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Productivity Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="goalsCompleted" stroke="#3b82f6" name="Goals Completed" />
                <Line type="monotone" dataKey="goalsAssigned" stroke="#f59e0b" name="Goals Assigned" />
                <Line type="monotone" dataKey="qualityScore" stroke="#10b981" name="Quality Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Hours vs Productivity Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hoursWorked" fill="#8b5cf6" name="Hours Worked" />
                <Bar dataKey="productivityRate" fill="#f59e0b" name="Productivity Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div style={styles.chartContainer}>
          <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
            <p> No data available for the selected period. Add new entries to see charts.</p>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={styles.chartTitle}> Detailed Records</h3>
        </div>
        {loading ? (
          <div style={{ padding: "1rem", color: "#6b7280" }}>Loading productivity data...</div>
        ) : productivityData.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            <p>📭 No entries found. Click "Add Entry" to record productivity data.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Hours</th>
                <th style={styles.th}>Goals Assigned</th>
                <th style={styles.th}>Goals Completed</th>
                <th style={styles.th}>Quality Score</th>
                <th style={styles.th}>Productivity Rate</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData().map((entry, index) => (
                <tr key={entry.id || index}>
                  <td style={styles.td}>{new Date(entry.date).toLocaleDateString()}</td>
                  <td style={styles.td}>{entry.hoursWorked}h</td>
                  <td style={styles.td}>{entry.goalsAssigned}</td>
                  <td style={styles.td}>{entry.goalsCompleted}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(
                      entry.qualityScore >= 80 ? "completed" :
                      entry.qualityScore >= 60 ? "inProgress" :
                      entry.qualityScore >= 40 ? "review" : "pending"
                    )}>
                      {entry.qualityScore}%
                    </span>
                  </td>
                  <td style={styles.td}>{entry.productivityRate}%</td>
                  <td style={styles.td}>
                    <button 
                      style={{...styles.button, padding: "0.25rem 0.75rem", fontSize: "0.75rem"}}
                      onClick={() => handleEdit(entry)}
                    >
                       Edit
                    </button>
                    <button 
                      style={{...styles.buttonDanger, padding: "0.25rem 0.75rem", fontSize: "0.75rem"}}
                      onClick={() => handleDelete(entry.id)}
                    >
                       Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay} onClick={() => {
          setShowForm(false);
          setEditingEntry(null);
          resetForm();
        }}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#1f2937" }}>
              {editingEntry ? " Edit Entry" : " Add New Entry"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}> Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={currentEntry.date}
                  onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}> Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    style={styles.input}
                    value={currentEntry.hoursWorked}
                    onChange={(e) => setCurrentEntry({...currentEntry, hoursWorked: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quality Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style={styles.input}
                    value={currentEntry.qualityScore}
                    onChange={(e) => setCurrentEntry({...currentEntry, qualityScore: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Goals Assigned</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.input}
                    value={currentEntry.goalsAssigned}
                    onChange={(e) => setCurrentEntry({...currentEntry, goalsAssigned: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}> Goals Completed</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.input}
                    value={currentEntry.goalsCompleted}
                    onChange={(e) => setCurrentEntry({...currentEntry, goalsCompleted: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  style={{...styles.input, minHeight: "60px"}}
                  value={currentEntry.notes}
                  onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                  placeholder="Add any additional notes here..."
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  style={styles.buttonSecondary}
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                >
                   Cancel
                </button>
                <button type="submit" style={styles.button} disabled={loading}>
                  {loading ? " Saving..." : (editingEntry ? " Update" : " Add") + " Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeProductivityMonitoring;