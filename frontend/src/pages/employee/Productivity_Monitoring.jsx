import React, { useState, useEffect, useCallback } from "react";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { Clock, CheckCircle, TrendingUp, Award, Target, Zap } from "lucide-react";

function ProductivityMonitoring() {
  // State Management
  const [productivityData, setProductivityData] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 0,
    goalsAssigned: 0,
    goalsCompleted: 0,
    tasks: [],
    timeSpent: 0,
    qualityScore: 0,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("week"); // week, month, year
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:8081/api`;

  const fetchProductivityData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Unable to load productivity data from the server.");
      }

      const data = await response.json();
      setProductivityData(data || []);
    } catch (err) {
      setError(err.message || "Could not connect to the productivity service.");
      setProductivityData([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchProductivityData();
  }, [fetchProductivityData]);

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

    const totalHours = filteredData.reduce((sum, d) => sum + d.hoursWorked, 0);
    const totalGoalsAssigned = filteredData.reduce((sum, d) => sum + d.goalsAssigned, 0);
    const totalGoalsCompleted = filteredData.reduce((sum, d) => sum + d.goalsCompleted, 0);
    const averageQuality = Math.round(filteredData.reduce((sum, d) => sum + d.qualityScore, 0) / filteredData.length);
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

  // Get filtered data based on selected filter
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...currentEntry,
      productivityRate: currentEntry.goalsAssigned > 0 
        ? Math.round((currentEntry.goalsCompleted / currentEntry.goalsAssigned) * 100) 
        : 0,
      timeSpent: Math.round((currentEntry.hoursWorked || 0) * 60),
      qualityScore: Number(currentEntry.qualityScore || 0)
    };

    try {
      setLoading(true);
      setError("");


      const response = editingEntry
        ? await fetch(`${API_BASE_URL}/${editingEntry.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
        : await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

      if (!response.ok) {
        throw new Error("Unable to save the productivity entry.");
      }

      const savedEntry = await response.json();
      if (editingEntry) {
        setProductivityData(prev => prev.map(entry => entry.id === editingEntry.id ? savedEntry : entry));
      } else {
        setProductivityData(prev => [...prev, savedEntry]);
      }

      resetForm();
      setShowForm(false);
      setEditingEntry(null);
    } catch (err) {
      setError(err.message || "Could not save the productivity entry.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      hoursWorked: 0,
      goalsAssigned: 0,
      goalsCompleted: 0,
      tasks: [],
      timeSpent: 0,
      qualityScore: 0,
      notes: ""
    });
  };

  // Handle edit
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry(entry);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Unable to delete the productivity entry.");
      }

      setProductivityData(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete the productivity entry.");
    } finally {
      setLoading(false);
    }
  };

  // Export data as CSV
  const exportCSV = () => {
    const headers = ["Date", "Hours Worked", "Goals Assigned", "Goals Completed", "Quality Score", "Productivity Rate"];
    const rows = productivityData.map(d => [
      d.date,
      d.hoursWorked,
      d.goalsAssigned,
      d.goalsCompleted,
      d.qualityScore,
      d.productivityRate
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Chart data preparation
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
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>
            <TrendingUp size={32} color="#3b82f6" />
           Overall  Productivity Monitor
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button style={styles.button} onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-lg"></i> Add Entry
            </button>
            <button style={{...styles.button, backgroundColor: "#10b981"}} onClick={exportCSV}>
              <i className="bi bi-download"></i> Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "8px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
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

        {/* Filter Section */}
        <div style={{ ...styles.filterSection, marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280", marginRight: "0.5rem" }}>Filter:</span>
          {["week", "month", "year"].map((f) => (
            <button
              key={f}
              style={styles.filterButton(filter === f)}
              onClick={() => setFilter(f)}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.backgroundColor === "#3b82f6") {
                  e.currentTarget.style.backgroundColor = "#93c5fd";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.backgroundColor = "white";
                }
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
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

      {/* Chart 2: Hours vs Productivity */}
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

      {/* Data Table */}
      <div style={styles.tableContainer}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={styles.chartTitle}>Detailed Records</h3>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {productivityData.length} entries
          </span>
        </div>
        {loading && !productivityData.length ? (
          <div style={{ padding: "1rem", color: "#6b7280" }}>Loading productivity data...</div>
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
              <tr key={index}>
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={styles.formOverlay} onClick={() => {
          setShowForm(false);
          setEditingEntry(null);
          resetForm();
        }}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#1f2937" }}>
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
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
                  <label style={styles.label}>Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    
                    style={styles.input}
                    value={currentEntry.hoursWorked}
                    onChange={(e) => setCurrentEntry({...currentEntry, hoursWorked: parseFloat(e.target.value)})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quality Score (%)</label>
                  <input
                    type="number"
                  
                    max="100"
                    style={styles.input}
                    value={currentEntry.qualityScore}
                    onChange={(e) => setCurrentEntry({...currentEntry, qualityScore: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Goals Assigned</label>
                  <input
                    type="number"
                  
                    style={styles.input}
                    value={currentEntry.goalsAssigned}
                    onChange={(e) => setCurrentEntry({...currentEntry, goalsAssigned: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Goals Completed</label>
                  <input
                    type="number"
                  
                    style={styles.input}
                    value={currentEntry.goalsCompleted}
                    onChange={(e) => setCurrentEntry({...currentEntry, goalsCompleted: parseInt(e.target.value)})}
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
                <button type="submit" style={styles.button}>
                  {editingEntry ? "Update" : "Add"} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductivityMonitoring;