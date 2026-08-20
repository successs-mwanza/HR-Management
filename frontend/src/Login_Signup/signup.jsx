import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../apiConfig";
import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    nrc: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    // remove error when typing
    setErrors({
      ...errors,
      [e.target.name]: ""
    });
  };

  // ✅ VALIDATION FUNCTION
  const validate = () => {
    let newErrors = {};

    // Fullname
    if (!form.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    // Email
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    // NRC (simple check)
    if (!form.nrc) {
      newErrors.nrc = "NRC is required";
    } else if (form.nrc.length < 6) {
      newErrors.nrc = "Invalid NRC";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullname: form.fullname,
          email: form.email,
          password: form.password,
          nrc: form.nrc
        })
      });

      const data = await response.text();

      if (response.ok) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        setErrors({ general: data });
      }

    } catch (err) {
      setErrors({ general: "Server error. Try again." });
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        {errors.general && <p className="error">{errors.general}</p>}

        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          onChange={handleChange}
        />
        {errors.fullname && <p className="error">{errors.fullname}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="text"
          name="nrc"
          placeholder="National Identity Number"
          onChange={handleChange}
        />
        {errors.nrc && <p className="error">{errors.nrc}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;