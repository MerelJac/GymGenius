import React from "react";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <section className="flex items-center flex-col">
        <p>Nothing to see here!</p>
        <button
          className=""
          onClick={() => {
            navigate("/login");
          }}
        >
          Login.
        </button>
      </section>
    </>
  );
};
