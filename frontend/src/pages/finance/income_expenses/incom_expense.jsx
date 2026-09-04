import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";


function IncomeExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    amount: "",
    date: "",
    description: "",
  });

  const [showForm, setShowForm] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
    title: "",
  });

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
  });

  const incomeCategories = ["Salary", "Bonus", "Investment Returns", "Other Income"];
  const expenseCategories = [
    "Office Supplies",
    "Utilities",
    "Travel",
    "Equipment",
    "Maintenance",
    "Transportation",
    "Meals & Entertainment",
    "Professional Services",
    "Rent",
    "Salaries & Wages",
    "Other Expense",
  ];

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(current => ({ ...current, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchTransactions = useCallback(async () => {
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
  }, [API_BASE_URL]);

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const showNotification = (title, message, type = "success") => {
    setNotification({
      show: true,
      message: message,
      type: type,
      title: title,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.amount || !formData.date) {
      showNotification("Validation Error", "Please fill all required fields", "warning");
      return;
    }

    try {
      const newTransaction = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
      };

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransaction),
      });

      if (!response.ok) {
        throw new Error("Failed to add transaction");
      }

      const savedTransaction = await response.json();
      setTransactions([savedTransaction, ...transactions]);
      setFormData({
        type: "income",
        category: "",
        amount: "",
        date: "",
        description: "",
      });
      setShowForm(false);
      showNotification("Success", "Transaction added successfully!", "success");
    } catch (err) {
      showNotification("Error", "Failed to add transaction: " + err.message, "error");
    }
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

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // --- Styles ---
  const styles = {
    // Navbar Styles
    navbar: {
      backgroundColor: "#0f172a",
      padding: "0 2rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      marginBottom: "2rem",
    },
    navLeft: {
      display: "flex",
      alignItems: "center",
      gap: "2rem",
    },
    navBrand: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "white",
      fontSize: "1.1rem",
      fontWeight: "700",
      textDecoration: "none",
      letterSpacing: "-0.025em",
    },
    navLinks: {
      display: "flex",
      gap: "0.5rem",
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      color: "#94a3b8",
      textDecoration: "none",
      borderRadius: "8px",
      fontSize: "0.875rem",
      fontWeight: "500",
      transition: "all 0.2s ease",
      cursor: "pointer",
      border: "none",
      background: "none",
    },
    navLinkActive: {
      backgroundColor: "rgba(255,255,255,0.1)",
      color: "white",
    },
    navRight: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    navBadge: {
      backgroundColor: "#10b981",
      color: "white",
      padding: "0.25rem 0.6rem",
      borderRadius: "12px",
      fontSize: "0.7rem",
      fontWeight: "600",
    },
    // Container
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1.5rem 2rem",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      flexWrap: "wrap",
      gap: "1rem",
    },
    headerTitle: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
      letterSpacing: "-0.025em",
    },
    headerActions: {
      display: "flex",
      gap: "0.75rem",
      flexWrap: "wrap",
    },
    addBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.7rem 1.5rem",
      backgroundColor: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontWeight: "600",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(15,23,42,0.2)",
    },
    historyBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.7rem 1.5rem",
      backgroundColor: "white",
      color: "#0f172a",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      fontWeight: "600",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.25rem",
      marginBottom: "2rem",
    },
    summaryCard: (bgColor, borderColor, textColor) => ({
      backgroundColor: bgColor,
      padding: "1.25rem 1.5rem",
      borderRadius: "14px",
      border: `1px solid ${borderColor}`,
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }),
    cardIcon: (bgColor, color) => ({
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      backgroundColor: bgColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      color: color,
      flexShrink: 0,
    }),
    cardContent: {
      flex: 1,
    },
    cardLabel: {
      fontSize: "0.75rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "#64748b",
      margin: "0 0 0.25rem 0",
    },
    cardAmount: (color) => ({
      fontSize: "1.5rem",
      fontWeight: "700",
      color: color,
      margin: 0,
    }),
    formContainer: {
      backgroundColor: "white",
      padding: "1.5rem",
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      marginBottom: "2rem",
      border: "1px solid #eef2f6",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
    },
    label: {
      fontSize: "0.8rem",
      fontWeight: "600",
      color: "#475569",
    },
    input: {
      padding: "0.6rem 0.8rem",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "0.9rem",
      backgroundColor: "white",
      color: "#1e293b",
      outline: "none",
      transition: "border 0.2s ease, box-shadow 0.2s ease",
    },
    select: {
      padding: "0.6rem 0.8rem",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "0.9rem",
      backgroundColor: "white",
      color: "#1e293b",
      outline: "none",
      transition: "border 0.2s ease, box-shadow 0.2s ease",
    },
    formActions: {
      display: "flex",
      gap: "0.75rem",
      justifyContent: "flex-end",
      paddingTop: "0.5rem",
    },
    submitBtn: {
      padding: "0.6rem 1.5rem",
      backgroundColor: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    cancelBtn: {
      padding: "0.6rem 1.5rem",
      backgroundColor: "#f1f5f9",
      color: "#475569",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    transactionsSection: {
      marginTop: "1.5rem",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    sectionTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
    },
    transactionList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    transactionItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.75rem 1rem",
      backgroundColor: "white",
      borderRadius: "10px",
      border: "1px solid #f1f5f9",
      transition: "all 0.15s ease",
    },
    transactionLeft: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      flex: 1,
    },
    transactionIcon: (type) => ({
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      backgroundColor: type === "income" ? "#dcfce7" : "#fee2e2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      color: type === "income" ? "#16a34a" : "#dc2626",
    }),
    transactionInfo: {
      flex: 1,
    },
    transactionCategory: {
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#0f172a",
    },
    transactionDesc: {
      fontSize: "0.8rem",
      color: "#94a3b8",
    },
    transactionDate: {
      fontSize: "0.75rem",
      color: "#94a3b8",
      marginRight: "1rem",
    },
    transactionAmount: (type) => ({
      fontWeight: "600",
      fontSize: "0.95rem",
      color: type === "income" ? "#16a34a" : "#dc2626",
      marginRight: "1rem",
    }),
    deleteBtn: {
      background: "none",
      border: "none",
      color: "#cbd5e1",
      cursor: "pointer",
      padding: "0.3rem 0.6rem",
      borderRadius: "6px",
      transition: "all 0.2s ease",
      fontSize: "1rem",
    },
    badge: (type) => ({
      display: "inline-block",
      padding: "0.15rem 0.6rem",
      borderRadius: "12px",
      fontSize: "0.6rem",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      backgroundColor: type === "income" ? "#dcfce7" : "#fee2e2",
      color: type === "income" ? "#166534" : "#991b1b",
      marginLeft: "0.5rem",
    }),
    emptyState: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#94a3b8",
      backgroundColor: "white",
      borderRadius: "12px",
      border: "1px solid #f1f5f9",
    },
    loading: {
      textAlign: "center",
      padding: "4rem 1rem",
      color: "#64748b",
    },
    error: {
      textAlign: "center",
      padding: "2rem 1rem",
      color: "#dc2626",
      backgroundColor: "#fef2f2",
      borderRadius: "12px",
      border: "1px solid #fecaca",
      marginBottom: "1.5rem",
    },
    // Modal shared styles
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

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Check if current route is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navBrand}>
            <i className="bi bi-wallet2" style={{ fontSize: "1.3rem" }}></i>
            <span>Finance Tracker</span>
          </div>
          <ul style={styles.navLinks}>
            <li>
              <button
                style={{
                  ...styles.navLink,
                  ...(isActive("/income-expenses") ? styles.navLinkActive : {}),
                }}
                onClick={() => navigate("/income-expenses")}
                onMouseEnter={(e) => {
                  if (!isActive("/income-expenses")) {
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive("/income-expenses")) {
                    e.currentTarget.style.color = "#94a3b8";
                  }
                }}
              >
                <i className="bi bi-currency-dollar"></i>
                Income & Expenses
              </button>
            </li>
            <li>
              <button
                style={{
                  ...styles.navLink,
                  ...(isActive("/transaction-history") ? styles.navLinkActive : {}),
                }}
                onClick={() => navigate("/transaction-history")}
                onMouseEnter={(e) => {
                  if (!isActive("/transaction-history")) {
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive("/transaction-history")) {
                    e.currentTarget.style.color = "#94a3b8";
                  }
                }}
              >
                <i className="bi bi-clock-history"></i>
                History
              </button>
            </li>
          </ul>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navBadge}>
            <i className="bi bi-database"></i> {transactions.length}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>💰 Income & Expense</h1>
          <div style={styles.headerActions}>
            <button
              style={styles.historyBtn}
              onClick={() => navigate("/transaction-history")}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              <i className="bi bi-clock-history"></i> History
            </button>
            <button
              style={styles.addBtn}
              onClick={() => setShowForm(!showForm)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f172a")}
            >
              <i className="bi bi-plus-circle"></i> {showForm ? "Close Form" : "Add Transaction"}
            </button>
          </div>
        </div>

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

        {/* Loading */}
        {loading ? (
          <div style={styles.loading}>
            <i
              className="bi bi-arrow-repeat spin"
              style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}
            ></i>
            <p>Loading transactions...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
              <div
                style={styles.summaryCard("#ecfdf5", "#bbf7d0", "#065f46")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                }}
              >
                <div style={styles.cardIcon("#bbf7d0", "#16a34a")}>
                  <i className="bi bi-arrow-down-circle"></i>
                </div>
                <div style={styles.cardContent}>
                  <p style={styles.cardLabel}>Total Income</p>
                  <p style={styles.cardAmount("#16a34a")}>K{totalIncome.toFixed(2)}</p>
                </div>
              </div>

              <div
                style={styles.summaryCard("#fef2f2", "#fecaca", "#991b1b")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                }}
              >
                <div style={styles.cardIcon("#fecaca", "#dc2626")}>
                  <i className="bi bi-arrow-up-circle"></i>
                </div>
                <div style={styles.cardContent}>
                  <p style={styles.cardLabel}>Total Expense</p>
                  <p style={styles.cardAmount("#dc2626")}>K{totalExpense.toFixed(2)}</p>
                </div>
              </div>

              <div
                style={{
                  ...styles.summaryCard(
                    netBalance >= 0 ? "#eff6ff" : "#fef2f2",
                    netBalance >= 0 ? "#bfdbfe" : "#fecaca",
                    netBalance >= 0 ? "#1e40af" : "#991b1b"
                  ),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  style={styles.cardIcon(
                    netBalance >= 0 ? "#bfdbfe" : "#fecaca",
                    netBalance >= 0 ? "#2563eb" : "#dc2626"
                  )}
                >
                  <i className="bi bi-wallet2"></i>
                </div>
                <div style={styles.cardContent}>
                  <p style={styles.cardLabel}>Net Balance</p>
                  <p style={styles.cardAmount(netBalance >= 0 ? "#2563eb" : "#dc2626")}>
                    K{netBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Add Transaction Form */}
            {showForm && (
              <div style={styles.formContainer}>
                <form style={styles.form} onSubmit={handleAddTransaction}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Type</label>
                      <select
                        style={styles.select}
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Category</label>
                      <select
                        style={styles.select}
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                      >
                        <option value="">Select Category</option>
                        {(formData.type === "income" ? incomeCategories : expenseCategories).map(
                          (cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Amount (K)</label>
                      <input
                        style={styles.input}
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        required
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Description</label>
                      <input
                        style={styles.input}
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Optional description"
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                      />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => setShowForm(false)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={styles.submitBtn}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f172a")}
                    >
                      <i className="bi bi-plus-lg"></i> Add Transaction
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Recent Transactions */}
            <div style={styles.transactionsSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Transactions</h2>
                {transactions.length > 0 && (
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Showing {Math.min(5, transactions.length)} of {transactions.length}
                  </span>
                )}
              </div>

              {recentTransactions.length === 0 ? (
                <div style={styles.emptyState}>
                  <i
                    className="bi bi-inbox"
                    style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.75rem", color: "#cbd5e1" }}
                  ></i>
                  <p style={{ margin: 0 }}>No transactions yet. Add your first one!</p>
                </div>
              ) : (
                <div style={styles.transactionList}>
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      style={styles.transactionItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor = "#f1f5f9";
                      }}
                    >
                      <div style={styles.transactionLeft}>
                        <div style={styles.transactionIcon(transaction.type)}>
                          <i
                            className={
                              transaction.type === "income" ? "bi bi-arrow-down" : "bi bi-arrow-up"
                            }
                          ></i>
                        </div>
                        <div style={styles.transactionInfo}>
                          <div style={styles.transactionCategory}>
                            {transaction.category}
                            <span style={styles.badge(transaction.type)}>
                              {transaction.type}
                            </span>
                          </div>
                          {transaction.description && (
                            <div style={styles.transactionDesc}>{transaction.description}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={styles.transactionDate}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        <span style={styles.transactionAmount(transaction.type)}>
                          {transaction.type === "income" ? "+" : "-"}K{transaction.amount.toFixed(2)}
                        </span>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDeleteClick(transaction.id)}
                          title="Delete"
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
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

        {/* Global styles */}
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
          .bi {
            font-family: "bootstrap-icons" !important;
          }
          select:focus, input:focus {
            outline: none;
            border-color: #94a3b8;
            box-shadow: 0 0 0 3px rgba(148,163,184,0.1);
          }
        `}</style>
      </div>
    </>
  );
}

export default IncomeExpense;