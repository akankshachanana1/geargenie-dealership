import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [dealerName, setDealerName] = useState("");
  const [garageName, setGarageName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/dealer/register`,
        {
          name: dealerName,       // ✅ FIXED
          garageName,
          email,
          password,
        }
      );

      setSuccess(true);
      setMessage("Signup successful!");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setSuccess(false);
      setMessage("Signup failed! Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-card" onSubmit={handleSignup}>
        <h2 className="signup-title">Create Account</h2>

        <input
          type="text"
          placeholder="Enter Dealer Name"
          className="input-box"
          value={dealerName}
          onChange={(e) => setDealerName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Garage Name"
          className="input-box"
          value={garageName}
          onChange={(e) => setGarageName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          className="input-box"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create Password"
          className="input-box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="signup-btn">Sign Up</button>

        {message && (
          <p className={success ? "success-text" : "error-text"}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Signup;
