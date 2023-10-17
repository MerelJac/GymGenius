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
    setRepsInputPlaceholder(Math.floor(reps));

  };

  const equationSetReps = (e) => {
    console.log(e);

    // Reset the repsInputPlaceholder to 'reps'
    setWeightInputPlaceholder("lbs");

    // Error handling
    let weight = (-0.0278 * e + 1.0278) * props.one_rep_max;
    setTimeout(() => {
      setWeightInputPlaceholder(Math.floor(weight));
    });
  };

  return (
    <>
      <div
        className=" w-full text-black flex flex-col items-center background-exercise-div px-4 py-2 mx-4 my-2"
        id={props.id}
      >
        <section className="w-full">
          <div className="flex flex-row gap-4 justify-between">
            <div>
              <h2 className="bold text-start text-black break-words">{props.full_name}</h2>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-col text-end">
              <input
                className="mb-2 text-sm font-small text-white text-center w-[15vw] max-h-[5vh]"
                placeholder={weightInputPlaceholder}
                onChange={(e) => equationSetWeight(e.target.value)}
              ></input>
              <p>lbs</p>
              </div>

              <div className="flex flex-col text-end">
              <input
                className="mb-2 text-sm font-small text-white text-center w-[15vw] max-h-[5vh]"
                placeholder={repsInputPlaceholder}
                onChange={(e) => equationSetReps(e.target.value)}
              ></input>
              <p>reps</p>
                </div>

            </div>
          </div>
        </section>
      </div>

    </>
  );
};
