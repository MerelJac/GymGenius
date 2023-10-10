import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Register = (props) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // TODO error handling for error while creating clinet side
  const handleSubmit = async (e) => {
    e.preventDefault();
    let user = {
      first_name: name,
      email: email,
      password: password,
    };
    console.log(user);
    try {
      const response = await fetch("http://localhost:3002/api/user-routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(user),
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log(data)
        // remove current token
        localStorage.clear()
        // set new token 
        localStorage.setItem("token", JSON.stringify(data));
        navigate('/')
      } else if (response.status === 400) {
        setMessage("Already making gains with that email.");
      } else {
        setMessage("Unable to register user");
      }
    } catch (err) {
      setMessage("An error has occured during registration.");
      console.error(err);
    }
  };

  return (
    // all info goes in here
    <div className="auth-form-container bottom-div">
      <section className="flex justify-between">
        <h2 className="right-align">Welcome</h2>
        <p>{message}</p>
      </section>
      <form className="column-right" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="name"
          placeholder="First name"
          id="name"
          name="name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          id="email"
          name="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          id="password"
          name="password"
        />

        <button type="submit">Register</button>
      </form>

      <button
        className="small-footer"
        onClick={() => (window.location.href = "/login")}
      >
        Already have an account? Login here.
      </button>
    </div>
  );
};