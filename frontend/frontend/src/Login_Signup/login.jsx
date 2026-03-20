import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.text();

      if (response.ok && data === "Login successful") {
        alert(data);

        // ✅ Save user session
        localStorage.setItem("userEmail", form.email);

        // ✅ Redirect to dashboard
        navigate("/employeelist");
      } else {
        setError(data);
      }
                                                 
    } 
    catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "blue", cursor: "pointer" }}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;                         