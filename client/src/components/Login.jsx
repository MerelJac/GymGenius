import React, { useState } from "react";
import "../assets/css/login.css";

// login function to send to API / backend
async function loginUser(credentials, setMessage) {
  try {
    const response = await fetch(
      "./api/user-routes/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      localStorage.clear();
      localStorage.setItem("token", JSON.stringify(data));
      window.location.href = "/";
    } else if (response.status === 401) {
      setMessage("Incorrect username or password");
    }
  } catch (err) {
    setMessage("An error occurred while logging in. ");
  }
}

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");





  // handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginUser(
      {
        email: email,
        password: password,
      },
      setMessage
    );
  };


  return (
    // all info goes in here
    <div className="auth-form-container fixed bottom-0 left-0 right-0 p-3 flex flex-col justify-between">
      <header className="flex justify-between">
        <h1 className="right-align ml-3">
          Welcome<span className="bold">Back</span>
        </h1>
        <p>{message}</p>
      </header>
      <div className="flex flex-col justify-end">
        <form className="column-right" onSubmit={handleSubmit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            className="text-end rounded"

          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            id="password"
            name="password"
            className="text-end rounded"

          />

          <button id="login" type="submit">
            Login
          </button>
        </form>

        <button
          className="text-sm flex justify-end"
          onClick={() => (window.location.href = "/register")}
        >
          Don't have an account? Register here.
        </button>
      </div>
    </div>
  );
};
