import React, { useState } from "react";

export const OneRepMaxStats = (props) => {
  const [weightInputPlaceholder, setWeightInputPlaceholder] = useState(
    props.one_rep_max
  );
  const [repsInputPlaceholder, setRepsInputPlaceholder] = useState(1);

  const equationSetWeight = (e) => {
    console.log(e);

    // Reset the repsInputPlaceholder to 'reps'
    setRepsInputPlaceholder("reps");

    // Error handling
    let reps = (e / props.one_rep_max - 1.0278) / -0.0278;

    setTimeout(() => {
      setRepsInputPlaceholder(Math.floor(reps));
    });
  };

  const equationSetReps = (e) => {
    console.log(e);

    // Reset the repsInputPlaceholder to 'reps'
    setWeightInputPlaceholder("lbs");

    // Error handling
    let weight = (-0.0278 * e + 1.0278) * props.one_rep_max;
    setTimeout(() => {
      setWeightInputPlaceholder(Math.floor(weight));
    }, 500);
  };

  return (
    <>
      <div className="exerciseDiv">
        <section className="row">
          <div className="exercise-text">
            <h2 className="bold">{props.full_name}</h2>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col">
              <input
                className="text-center w-[60px] weight"
                placeholder={weightInputPlaceholder}
                onChange={(e) => equationSetWeight(e.target.value)}
              ></input>
              <p>lbs</p>
            </div>
            <div className="flex flex-col">
              <input
                className="text-center w-[60px] reps"
                placeholder={repsInputPlaceholder}
                onChange={(e) => equationSetReps(e.target.value)}
              ></input>
              <p>reps</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
