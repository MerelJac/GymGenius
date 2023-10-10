import React from "react";

export const NotFoundExerciseDiv = (props) => {
  return (
    <>
      <div className="exerciseDiv">
        <section className="row">
          <div className="exercise-text">
            <h2 className="bold">{props.full_name}</h2>
          </div>
        </section>
      </div>
    </>
  );
};
