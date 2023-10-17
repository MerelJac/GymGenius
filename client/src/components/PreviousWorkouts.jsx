import React, { useState, useEffect } from "react";

export const PreviousWorkouts = () => {
  const [previousExercises, setPreviousExercises] = useState([]);

  useEffect(() => {
    // Fetch previous exercises based on user ID using GraphQL query (to be implemented)
    // For now, simulate fetching data
    const userId = localStorage.getItem('id');
    fetch(`/api/previous-exercises/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setPreviousExercises(data);
      });
  }, []);

  return (
    <div>
      <h2>Previous Exercises</h2>
      <ul>
        {previousExercises.map((exercise) => (
          <li key={exercise.id}>{exercise.date}</li>
        ))}
      </ul>
    </div>
  );
};

