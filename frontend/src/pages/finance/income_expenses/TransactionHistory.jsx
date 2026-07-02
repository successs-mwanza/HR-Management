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
    title: ""
  });
  
  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null
  });
  
  const API_BASE_URL = "http://localhost:8081/api/income-expenses";

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

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch =
      filterType === "all" || transaction.type === filterType;

    const searchMatch =
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

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
        `K${t.amount.toFixed(2)}`
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

  return (
    <div className="transaction-history-container">
      <div className="th-header">
        <div className="th-title-section">
          <button className="back-btn" onClick={() => navigate("/income-expenses")}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <h1>Transaction History</h1>
        </div>

        <button onClick={generatePDF} className="pdf-btn">
          <i className="bi bi-file-earmark-pdf"></i> Export PDF
        </button>
      </div>

      {loading && (
        <div className="loading">
          <p>Loading transactions...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchTransactions}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Filter and Search Section */}
          <div className="filter-section">
            <div className="filter-group">
              <label>Filter by Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="search-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search by category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Summary for Filtered Data */}
          <div className="filter-summary">
            <div className="summary-item income">
              <span>Total Income:</span>
              <strong>K{totalIncome.toFixed(2)}</strong>
            </div>
            <div className="summary-item expense">
              <span>Total Expense:</span>
              <strong>K{totalExpense.toFixed(2)}</strong>
            </div>
            <div className="summary-item balance">
              <span>Net:</span>
              <strong>K{(totalIncome - totalExpense).toFixed(2)}</strong>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="transactions-wrapper">
            {filteredTransactions.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${transaction.type}`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{transaction.category}</td>
                      <td>{transaction.description || "-"}</td>
                      <td className={`amount ${transaction.type}`}>
                        {transaction.type === "income" ? "+" : ""}K{transaction.amount.toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(transaction.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No transactions found matching your criteria.</p>
            )}
          </div>
        </>
      )}

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

export default TransactionHistory;