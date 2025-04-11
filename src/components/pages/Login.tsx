import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.scss'; // Import the styling

const Login: React.FC = () => {
  const [email, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      setError(""); // Clear any previous error

      try {
        // Make the API request to the backend for authentication
        const response = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email , password }),
        });

        if (!response.ok) {
          // Handle invalid login
          throw new Error("Invalid email or password");
        }

        // If login is successful, navigate to the interview page
        const data = await response.json();
        // Assume the backend returns a success message or a token
        if (data.role=="admin") {
          // localStorage.setItem("authToken", data.token); // Save token in localStorage (optional)
          navigate("/admin");
        }
        if (data.role=="user") {
           localStorage.setItem("userEmail", data.userEmail); // Save token in localStorage (optional)
          navigate("/interview");
        }
      } catch (error: any) {
        setError(error.message || "An error occurred. Please try again.");
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    } else {
      setError("Please enter both email and password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <div className="input-group">
          <label htmlFor="email">Username</label>
          <input
            type="text"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login to Start Interview"}
        </button>
      </div>
    </div>
  );
};

export default Login;
