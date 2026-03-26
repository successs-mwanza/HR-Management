import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./transaction-history.css";

function TransactionHistory() {
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE_URL = "http://localhost:8080/api/income-expenses";

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
  }, []);

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
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      setTransactions(transactions.filter((t) => t.id !== id));
      alert("Transaction deleted successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Error deleting transaction:", err);
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

  // ✅ PDF FUNCTION (only addition)
  const generatePDF = () => {
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

        {/* ✅ ONLY ADDED BUTTON */}
        <button onClick={generatePDF}>
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
                          onClick={() => handleDeleteTransaction(transaction.id)}
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
    </div>
  );
}

export default TransactionHistory;