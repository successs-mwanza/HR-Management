import React, { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from "recharts";

function ProductivityMonitor() {
  // State Management
  const [productivityData, setProductivityData] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    goalsAssigned: '',
    goalsCompleted: '',
    qualityScore: '',
    notes: ""
  });
  const [filter, setFilter] = useState("week");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate statistics from current data
  const calculateStatistics = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        totalHours: 0,
        totalGoalsAssigned: 0,
        totalGoalsCompleted: 0,
        averageQuality: 0,
        completionRate: 0,
        efficiency: 0,
        totalEntries: 0
      };
    }

    const totalHours = filteredData.reduce((sum, d) => sum + parseFloat(d.hoursWorked), 0);
    const totalGoalsAssigned = filteredData.reduce((sum, d) => sum + parseInt(d.goalsAssigned), 0);
    const totalGoalsCompleted = filteredData.reduce((sum, d) => sum + parseInt(d.goalsCompleted), 0);
    const averageQuality = Math.round(filteredData.reduce((sum, d) => sum + parseInt(d.qualityScore), 0) / filteredData.length);
    const completionRate = totalGoalsAssigned > 0 ? Math.round((totalGoalsCompleted / totalGoalsAssigned) * 100) : 0;
    const efficiency = totalHours > 0 ? Math.round((totalGoalsCompleted / totalHours) * 10) / 10 : 0;

    return {
      totalHours,
      totalGoalsAssigned,
      totalGoalsCompleted,
      averageQuality,
      completionRate,
      efficiency,
      totalEntries: filteredData.length
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
        startDate.setDate(today.getDate() - 30);
    }
    
    const startStr = startDate.toISOString().split('T')[0];
    
    let filtered = productivityData.filter(d => d.date >= startStr);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.date.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!currentEntry.date || !currentEntry.hoursWorked || !currentEntry.goalsAssigned || 
        !currentEntry.goalsCompleted || !currentEntry.qualityScore) {
      alert("Please fill all required fields");
      return;
    }

    const newEntry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(),
      date: currentEntry.date,
      hoursWorked: parseFloat(currentEntry.hoursWorked),
      goalsAssigned: parseInt(currentEntry.goalsAssigned),
      goalsCompleted: parseInt(currentEntry.goalsCompleted),
      qualityScore: parseInt(currentEntry.qualityScore),
      productivityRate: currentEntry.goalsAssigned > 0 
        ? Math.round((parseInt(currentEntry.goalsCompleted) / parseInt(currentEntry.goalsAssigned)) * 100) 
        : 0,
      notes: currentEntry.notes || ""
    };

    if (editingEntry) {
      // Update existing entry
      setProductivityData(prev => 
        prev.map(entry => entry.id === editingEntry.id ? newEntry : entry)
      );
    } else {
      // Add new entry
      setProductivityData(prev => [newEntry, ...prev]);
    }

    resetForm();
    setShowForm(false);
    setEditingEntry(null);
  };

  // Reset form
  const resetForm = () => {
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      hoursWorked: '',
      goalsAssigned: '',
      goalsCompleted: '',
      qualityScore: '',
      notes: ""
    });
  };

  // Handle edit
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry({
      date: entry.date,
      hoursWorked: entry.hoursWorked.toString(),
      goalsAssigned: entry.goalsAssigned.toString(),
      goalsCompleted: entry.goalsCompleted.toString(),
      qualityScore: entry.qualityScore.toString(),
      notes: entry.notes || ""
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setProductivityData(prev => prev.filter(entry => entry.id !== id));
    }
  };

  // Export data as CSV
  const exportCSV = () => {
    if (productivityData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "Hours Worked", "Goals Assigned", "Goals Completed", "Quality Score", "Productivity Rate", "Notes"];
    const rows = productivityData.map(d => [
      d.date,
      d.hoursWorked,
      d.goalsAssigned,
      d.goalsCompleted,
      d.qualityScore,
      d.productivityRate || Math.round((d.goalsCompleted / d.goalsAssigned) * 100),
      d.notes || ""
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Import data from CSV
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        const importedData = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: values[0] || new Date().toISOString().split('T')[0],
            hoursWorked: parseFloat(values[1]) || 0,
            goalsAssigned: parseInt(values[2]) || 0,
            goalsCompleted: parseInt(values[3]) || 0,
            qualityScore: parseInt(values[4]) || 0,
            productivityRate: parseInt(values[5]) || 0,
            notes: values[6] || ""
          };
        });
        
        setProductivityData(prev => [...importedData, ...prev]);
        alert(`Successfully imported ${importedData.length} entries!`);
      } catch (error) {
        alert("Error importing CSV: " + error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone!")) {
      setProductivityData([]);
    }
  };

  // Prepare chart data
  const chartData = getFilteredData().map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString(),
    productivityRate: d.productivityRate || Math.round((d.goalsCompleted / d.goalsAssigned) * 100)
  }));

  const stats = calculateStatistics();

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
      transition: "transform 0.2s, box-shadow 0.2s",
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
    buttonSuccess: {
      padding: "0.5rem 1.5rem",
      backgroundColor: "#10b981",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "0.875rem"
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      color: "#9ca3af"
    },
    fileInput: {
      display: "none"
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>
            <i className="bi bi-graph-up-arrow" style={{ fontSize: "2rem", color: "#3b82f6" }}></i>
            Productivity Monitor
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button style={styles.button} onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-lg"></i> Add Entry
            </button>
            <button style={styles.buttonSuccess} onClick={exportCSV}>
              <i className="bi bi-download"></i> Export CSV
            </button>
            <label style={{...styles.buttonSuccess, cursor: "pointer"}}>
              <i className="bi bi-upload"></i> Import CSV
              <input 
                type="file" 
                accept=".csv" 
                style={styles.fileInput} 
                onChange={importCSV}
              />
            </label>
            <button style={styles.buttonDanger} onClick={clearAllData}>
              <i className="bi bi-trash"></i> Clear All
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div 
            style={styles.statCard("#eff6ff")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <p style={styles.statLabel}>
              <i className="bi bi-clock" style={{ color: "#3b82f6" }}></i> Total Hours
            </p>
            <p style={styles.statValue}>{stats.totalHours.toFixed(1)}h</p>
          </div>
          <div 
            style={styles.statCard("#f0fdf4")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <p style={styles.statLabel}>
              <i className="bi bi-bullseye" style={{ color: "#10b981" }}></i> Goals Completed
            </p>
            <p style={styles.statValue}>{stats.totalGoalsCompleted}/{stats.totalGoalsAssigned}</p>
          </div>
          <div 
            style={styles.statCard("#fef3c7")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <p style={styles.statLabel}>
              <i className="bi bi-trophy" style={{ color: "#f59e0b" }}></i> Quality Score
            </p>
            <p style={styles.statValue}>{stats.averageQuality}%</p>
          </div>
          <div 
            style={styles.statCard("#ede9fe")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <p style={styles.statLabel}>
              <i className="bi bi-lightning" style={{ color: "#8b5cf6" }}></i> Efficiency
            </p>
            <p style={styles.statValue}>{stats.efficiency} goals/h</p>
          </div>
          <div 
            style={styles.statCard("#fce4ec")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <p style={styles.statLabel}>
              <i className="bi bi-check-circle" style={{ color: "#ef4444" }}></i> Completion Rate
            </p>
            <p style={styles.statValue}>{stats.completionRate}%</p>
          </div>
          <div 
            style={styles.statCard("#e0f2fe")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <p style={styles.statLabel}>
              <i className="bi bi-list-ul" style={{ color: "#0ea5e9" }}></i> Total Entries
            </p>
            <p style={styles.statValue}>{stats.totalEntries}</p>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div style={styles.filterSection}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280", marginRight: "0.5rem" }}>Filter:</span>
          {["week", "month", "year", "all"].map((f) => (
            <button
              key={f}
              style={styles.filterButton(filter === f)}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search by date or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Charts */}
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
                <Line type="monotone" dataKey="goalsCompleted" stroke="#3b82f6" name="Goals Completed" strokeWidth={2} />
                <Line type="monotone" dataKey="goalsAssigned" stroke="#f59e0b" name="Goals Assigned" strokeWidth={2} />
                <Line type="monotone" dataKey="qualityScore" stroke="#10b981" name="Quality Score" strokeWidth={2} />
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
          <div style={styles.emptyState}>
            <i className="bi bi-bar-chart-line" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem", color: "#d1d5db" }}></i>
            <h3 style={{ color: "#6b7280" }}>No Data to Display</h3>
            <p style={{ color: "#9ca3af" }}>Add your first productivity entry to see charts here.</p>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div style={styles.tableContainer}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={styles.chartTitle}>Detailed Records</h3>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Showing {getFilteredData().length} of {productivityData.length} entries
          </span>
        </div>
        
        {productivityData.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="bi bi-inbox" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem", color: "#d1d5db" }}></i>
            <p style={{ color: "#9ca3af" }}>No productivity data found. Click "Add Entry" to get started!</p>
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
                <th style={styles.th}>Notes</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData().map((entry) => (
                <tr key={entry.id} style={{ transition: "background 0.2s" }}>
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
                  <td style={styles.td}>
                    <span style={{ fontWeight: "600", color: entry.productivityRate >= 80 ? "#10b981" : "#f59e0b" }}>
                      {entry.productivityRate || Math.round((entry.goalsCompleted / entry.goalsAssigned) * 100)}%
                    </span>
                  </td>
                  <td style={styles.td}>{entry.notes || "-"}</td>
                  <td style={styles.td}>
                    <button 
                      style={{...styles.button, padding: "0.25rem 0.75rem", fontSize: "0.75rem", marginRight: "0.5rem"}}
                      onClick={() => handleEdit(entry)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      style={{...styles.buttonDanger, padding: "0.25rem 0.75rem", fontSize: "0.75rem"}}
                      onClick={() => handleDelete(entry.id)}
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
          setEditingEntry(null);
          resetForm();
        }}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#1f2937" }}>
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
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
                  <label style={styles.label}>Hours Worked *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    style={styles.input}
                    value={currentEntry.hoursWorked}
                    onChange={(e) => setCurrentEntry({...currentEntry, hoursWorked: e.target.value})}
                    placeholder="e.g., 8.5"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quality Score (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style={styles.input}
                    value={currentEntry.qualityScore}
                    onChange={(e) => setCurrentEntry({...currentEntry, qualityScore: e.target.value})}
                    placeholder="0-100"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Goals Assigned *</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.input}
                    value={currentEntry.goalsAssigned}
                    onChange={(e) => setCurrentEntry({...currentEntry, goalsAssigned: e.target.value})}
                    placeholder="e.g., 5"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Goals Completed *</label>
                  <input
                    type="number"
                    min="0"
                    style={styles.input}
                    value={currentEntry.goalsCompleted}
                    onChange={(e) => setCurrentEntry({...currentEntry, goalsCompleted: e.target.value})}
                    placeholder="e.g., 4"
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={{...styles.input, minHeight: "60px"}}
                  value={currentEntry.notes}
                  onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                  placeholder="Add any additional notes..."
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
                  {editingEntry ? "Update Entry" : "Add Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
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

export default ProductivityMonitor;