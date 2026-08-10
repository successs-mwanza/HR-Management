import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function TransactionHistory() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // success, error, warning, info
    title: "",
  });

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
  });

  const API_BASE_URL = "http://192.168.122.131:8081/api/income-expenses";

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showNotification("Error", "Failed to fetch transactions: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (title, message, type = "success") => {
    setNotification({
      show: true,
      message: message,
      type: type,
      title: title,
    });
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({
      show: true,
      id: id,
    });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      setTransactions(transactions.filter((t) => t.id !== id));
      setDeleteConfirm({ show: false, id: null });
      showNotification("Success", "Transaction deleted successfully!", "success");
    } catch (err) {
      setDeleteConfirm({ show: false, id: null });
      showNotification("Error", "Failed to delete transaction: " + err.message, "error");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;

    const searchMatch =
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    return typeMatch && searchMatch;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      doc.text("Transaction Report", 14, 15);
      doc.text(`Total Income: K${totalIncome.toFixed(2)}`, 14, 25);
      doc.text(`Total Expense: K${totalExpense.toFixed(2)}`, 14, 32);
      doc.text(`Net: K${(totalIncome - totalExpense).toFixed(2)}`, 14, 39);

      const tableData = filteredTransactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type.toUpperCase(),
        t.category,
        t.description || "-",
        `K${t.amount.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["Date", "Type", "Category", "Description", "Amount"]],
        body: tableData,
      });

      doc.save("transaction-report.pdf");
      showNotification("Success", "PDF report generated successfully!", "success");
    } catch (err) {
      showNotification("Error", "Failed to generate PDF: " + err.message, "error");
    }
  };

  // --- Styles ---
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem 1.5rem",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "1rem",
      marginBottom: "2rem",
    },
    titleSection: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      color: "#475569",
      fontWeight: "500",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    pageTitle: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
      letterSpacing: "-0.025em",
    },
    pdfBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.6rem 1.25rem",
      backgroundColor: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(15,23,42,0.2)",
    },
    filterSection: {
      display: "flex",
      flexWrap: "wrap",
      gap: "1.5rem",
      backgroundColor: "white",
      padding: "1.25rem 1.5rem",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      marginBottom: "1.5rem",
      alignItems: "flex-end",
      border: "1px solid #eef2f6",
    },
    filterGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
      flex: "1 1 200px",
    },
    label: {
      fontSize: "0.8rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#64748b",
    },
    select: {
      padding: "0.6rem 0.8rem",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "0.9rem",
      backgroundColor: "white",
      color: "#1e293b",
      outline: "none",
      transition: "border 0.2s ease",
    },
    input: {
      padding: "0.6rem 0.8rem",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "0.9rem",
      backgroundColor: "white",
      color: "#1e293b",
      outline: "none",
      transition: "border 0.2s ease",
      minWidth: "200px",
    },
    summary: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      marginBottom: "2rem",
    },
    summaryCard: (bgColor, textColor) => ({
      backgroundColor: bgColor,
      padding: "1rem 1.25rem",
      borderRadius: "12px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      border: "1px solid rgba(0,0,0,0.04)",
    }),
    summaryLabel: {
      fontSize: "0.75rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#64748b",
      display: "block",
      marginBottom: "0.25rem",
    },
    summaryValue: (color) => ({
      fontSize: "1.5rem",
      fontWeight: "700",
      color: color,
      margin: 0,
    }),
    tableWrapper: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      overflow: "auto",
      border: "1px solid #eef2f6",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      minWidth: "600px",
    },
    th: {
      textAlign: "left",
      padding: "0.9rem 1rem",
      backgroundColor: "#f8fafc",
      color: "#475569",
      fontWeight: "600",
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      borderBottom: "1px solid #eef2f6",
    },
    td: {
      padding: "0.9rem 1rem",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "0.9rem",
      color: "#1e293b",
    },
    badge: (type) => ({
      display: "inline-block",
      padding: "0.2rem 0.7rem",
      borderRadius: "20px",
      fontSize: "0.7rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      backgroundColor: type === "income" ? "#dcfce7" : "#fee2e2",
      color: type === "income" ? "#166534" : "#991b1b",
    }),
    amount: (type) => ({
      fontWeight: "600",
      color: type === "income" ? "#16a34a" : "#dc2626",
    }),
    deleteBtn: {
      background: "none",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      padding: "0.3rem 0.6rem",
      borderRadius: "6px",
      transition: "all 0.2s ease",
      fontSize: "1rem",
    },
    noData: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#94a3b8",
      fontSize: "0.95rem",
    },
    loading: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#64748b",
    },
    error: {
      textAlign: "center",
      padding: "2rem 1rem",
      color: "#dc2626",
      backgroundColor: "#fef2f2",
      borderRadius: "12px",
      border: "1px solid #fecaca",
    },
    // Modal overlay (shared)
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15,23,42,0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1050,
      animation: "fadeIn 0.2s ease",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "16px",
      maxWidth: "400px",
      width: "90%",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      overflow: "hidden",
      padding: "1.5rem",
    },
    modalIconWrapper: (bgColor) => ({
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      backgroundColor: bgColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1rem",
    }),
    modalTitle: {
      textAlign: "center",
      margin: "0 0 0.5rem 0",
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#0f172a",
    },
    modalMessage: {
      textAlign: "center",
      margin: "0 0 1.5rem 0",
      fontSize: "0.9rem",
      color: "#64748b",
      lineHeight: "1.5",
    },
    modalButtonGroup: {
      display: "flex",
      gap: "0.75rem",
      justifyContent: "center",
    },
    modalButton: (bgColor, textColor = "white") => ({
      padding: "0.6rem 1.5rem",
      backgroundColor: bgColor,
      color: textColor,
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "500",
      transition: "all 0.2s ease",
    }),
  };

  // Helper to get notification icon/color
  const getNotificationMeta = (type) => {
    switch (type) {
      case "success":
        return { icon: "bi-check-circle-fill", color: "#10b981", bg: "#d1fae5" };
      case "error":
        return { icon: "bi-exclamation-triangle-fill", color: "#ef4444", bg: "#fee2e2" };
      case "warning":
        return { icon: "bi-exclamation-circle-fill", color: "#f59e0b", bg: "#fef3c7" };
      default:
        return { icon: "bi-info-circle-fill", color: "#3b82f6", bg: "#dbeafe" };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/income-expenses")}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <h1 style={styles.pageTitle}>Transaction History</h1>
        </div>
        <button
          style={styles.pdfBtn}
          onClick={generatePDF}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f172a")}
        >
          <i className="bi bi-file-earmark-pdf"></i> Export PDF
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loading}>
          <i className="bi bi-arrow-repeat spin" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.error}>
          <p style={{ margin: "0 0 1rem 0" }}>Error: {error}</p>
          <button
            onClick={fetchTransactions}
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Filter Section */}
          <div style={styles.filterSection}>
            <div style={styles.filterGroup}>
              <label style={styles.label}>Filter by Type</label>
              <select
                style={styles.select}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.label}>Search</label>
              <input
                type="text"
                placeholder="Search by category or description..."
                style={styles.input}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div style={styles.summary}>
            <div style={styles.summaryCard("#ecfdf5", "#065f46")}>
              <span style={styles.summaryLabel}>Total Income</span>
              <p style={styles.summaryValue("#16a34a")}>K{totalIncome.toFixed(2)}</p>
            </div>
            <div style={styles.summaryCard("#fef2f2", "#991b1b")}>
              <span style={styles.summaryLabel}>Total Expense</span>
              <p style={styles.summaryValue("#dc2626")}>K{totalExpense.toFixed(2)}</p>
            </div>
            <div style={styles.summaryCard("#eff6ff", "#1e40af")}>
              <span style={styles.summaryLabel}>Net</span>
              <p style={styles.summaryValue("#2563eb")}>K{(totalIncome - totalExpense).toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <div style={styles.tableWrapper}>
            {filteredTransactions.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={styles.td}>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <span style={styles.badge(transaction.type)}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>{transaction.category}</td>
                      <td style={styles.td}>{transaction.description || "-"}</td>
                      <td style={{ ...styles.td, ...styles.amount(transaction.type) }}>
                        {transaction.type === "income" ? "+" : ""}K{transaction.amount.toFixed(2)}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDeleteClick(transaction.id)}
                          title="Delete"
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.noData}>
                <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                <p>No transactions found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div
          style={styles.modalOverlay}
          onClick={() => setNotification({ ...notification, show: false })}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const meta = getNotificationMeta(notification.type);
              return (
                <>
                  <div style={styles.modalIconWrapper(meta.bg)}>
                    <i className={meta.icon} style={{ fontSize: "28px", color: meta.color }}></i>
                  </div>
                  <h3 style={styles.modalTitle}>{notification.title}</h3>
                  <p style={styles.modalMessage}>{notification.message}</p>
                  <div style={{ textAlign: "center" }}>
                    <button
                      style={styles.modalButton(meta.color)}
                      onClick={() => setNotification({ ...notification, show: false })}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      OK
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          style={styles.modalOverlay}
          onClick={() => setDeleteConfirm({ show: false, id: null })}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIconWrapper("#fee2e2")}>
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "28px", color: "#ef4444" }}></i>
            </div>
            <h3 style={styles.modalTitle}>Confirm Delete</h3>
            <p style={styles.modalMessage}>
              Are you sure you want to delete this transaction?
              <br />
              <span style={{ fontSize: "0.8rem", color: "#ef4444" }}>This action cannot be undone.</span>
            </p>
            <div style={styles.modalButtonGroup}>
              <button
                style={styles.modalButton("#e2e8f0", "#475569")}
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#cbd5e1")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
              >
                Cancel
              </button>
              <button
                style={styles.modalButton("#ef4444")}
                onClick={confirmDelete}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global keyframes for spin and fadeIn */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        /* For Bootstrap icons if not already loaded */
        .bi {
          font-family: "bootstrap-icons" !important;
        }
        /* Hover row effect */
        tbody tr:hover {
          background-color: #f8fafc;
          transition: background 0.15s ease;
        }
        /* Focus styles for inputs */
        select:focus, input:focus {
          outline: none;
          border-color: #94a3b8;
          box-shadow: 0 0 0 3px rgba(148,163,184,0.1);
        }
      `}</style>
    </div>
  );
}

export default TransactionHistory;