import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function IncomeExpense() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:8081/api/income-expenses";

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
    title: ""
  });
  
  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null
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
      title: title
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
      id: id
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
    zIndex: 1050,
    animation: "fadeIn 0.3s ease"
  };

  const modalStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    overflow: "hidden"
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "success": return "bi-check-circle-fill";
      case "error": return "bi-exclamation-triangle-fill";
      case "warning": return "bi-exclamation-circle-fill";
      default: return "bi-info-circle-fill";
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case "success": return "#10b981";
      case "error": return "#ef4444";
      case "warning": return "#f59e0b";
      default: return "#3b82f6";
    }
  };

  if (loading) {
    return (
      <div className="income-expense-container">
        <div className="loading">
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="income-expense-container">
      <div className="ie-header">
        <button
          className="add-transaction-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="bi bi-plus-circle"></i> Add Transaction
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchTransactions}>Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">
            <i className="bi bi-arrow-down-circle"></i>
          </div>
          <div className="card-content">
            <h3>Total Income</h3>
            <p className="amount">K{totalIncome.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">
            <i className="bi bi-arrow-up-circle"></i>
          </div>
          <div className="card-content">
            <h3>Total Expense</h3>
            <p className="amount">K{totalExpense.toFixed(2)}</p>
          </div>
        </div>

        <div className={`summary-card balance ${netBalance >= 0 ? "positive" : "negative"}`}>
          <div className="card-icon">
            <i className="bi bi-wallet2"></i>
          </div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className="amount">K{netBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddTransaction}>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {(formData.type === "income"
                    ? incomeCategories
                    : expenseCategories
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Add Transaction
              </button>
 
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Section */}
      <div className="transactions-section">
        <button 
          className="view-history-btn"
          onClick={() => navigate("/transaction-history")}
        >
          <i className="bi bi-clock-history"></i> View Transaction History
        </button>
      </div>

      {/* Notification Modal */}
      {notification.show && (
        <div style={modalOverlayStyle} onClick={() => setNotification({ ...notification, show: false })}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              padding: "20px",
              textAlign: "center"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: `${getNotificationColor(notification.type)}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <i className={getNotificationIcon(notification.type)} style={{
                  fontSize: "32px",
                  color: getNotificationColor(notification.type)
                }}></i>
              </div>
              <h3 style={{ 
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b"
              }}>
                {notification.title}
              </h3>
              <p style={{
                margin: "0",
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.5"
              }}>
                {notification.message}
              </p>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                style={{
                  marginTop: "20px",
                  padding: "8px 24px",
                  backgroundColor: getNotificationColor(notification.type),
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                onMouseLeave={(e) => e.target.style.opacity = "1"}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm({ show: false, id: null })}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <i className="bi bi-exclamation-triangle-fill" style={{
                  fontSize: "32px",
                  color: "#ef4444"
                }}></i>
              </div>
              <h3 style={{ 
                textAlign: "center",
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b"
              }}>
                Confirm Delete
              </h3>
              <p style={{
                textAlign: "center",
                margin: "0 0 20px 0",
                fontSize: "14px",
                color: "#64748b"
              }}>
                Are you sure you want to delete this transaction?
                <br />
                <span style={{ fontSize: "12px", color: "#ef4444" }}>This action cannot be undone.</span>
              </p>
              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center"
              }}>
                <button
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#e2e8f0",
                    color: "#475569",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#cbd5e1"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#e2e8f0"}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add animation keyframes to your CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default IncomeExpense;