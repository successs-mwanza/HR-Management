import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function IncomeExpense() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:8081/api/income-expenses"; // api base URL

  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    amount: "",
    date: "",
    description: "",
  });

  const [showForm, setShowForm] = useState(false);

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
      alert("Please fill all fields");
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
      alert("Transaction added successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Error adding transaction:", err);
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

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

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
    </div>
  );
}

export default IncomeExpense;
