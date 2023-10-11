import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";

export const ExerciseDiv = (props) => {
  const [sets, setSets] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [weightInputPlaceholder, setWeightInputPlaceholder] = useState("lbs");
  const [repsInputPlaceholder, setRepsInputPlaceholder] = useState("reps");
  const [newExercise, setNewExercise] = useState(false);
  const [isShown, setIsShown] = useState(false);

  let current1Rm = props.oneRepMax;

  useEffect(() => {
    if (props.oneRepMax > 0) {
      setNewExercise(true);
    } else {
      setNewExercise(false);
    }
  }, [props.oneRepMax]);

  const equationSetWeight = (e) => {
    setWeightInput(e);

    // Reset the repsInputPlaceholder to 'reps'
    setRepsInputPlaceholder("reps");

    // Error handling
    if (newExercise) {
      let reps = (e / props.oneRepMax - 1.0278) / -0.0278;

      setRepsInputPlaceholder(Math.floor(reps));
    }
  };

  const equationSetReps = (e) => {
    setRepsInput(e);

    // Reset the repsInputPlaceholder to 'reps'
    setWeightInputPlaceholder("lbs");

    // Error handling
    if (newExercise) {
      let weight = (-0.0278 * e + 1.0278) * props.oneRepMax;

      setWeightInputPlaceholder(Math.floor(weight));
    }
  };

  const setInfo = async (e) => {
    e.preventDefault();
    const reps = parseInt(repsInput);
    const weight = parseInt(weightInput);

    if (!isNaN(reps) && !isNaN(weight)) {
      let testMax = await oneRepMaxFunction(weight, reps);
      if (testMax > current1Rm) {
        current1Rm = testMax;

        // send back ID and 1RM
        const objectToSend = {
          id: props.id,
          new1RM: current1Rm,
        };
        console.log("should override 1RM", objectToSend);
        props.passData(objectToSend);
      }
      setSets([...sets, `${weight}lbs x ${reps}`]);
      setWeightInput("");
      setRepsInput("");
    } else {
      console.log("nothing happened");
    }
  };

  const toggleModal = () => {
    setIsShown(!isShown);
  };

  const modalClass = isShown
    ? "fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
    : "hidden";

  const oneRepMaxFunction = (weight, reps) => {
    if (weight >= 1) {
      // Epley formula for 1RM
      let test1RM = weight / (1.0278 - 0.0278 * reps);
      return Math.floor(test1RM);
    } else {
      return reps; // Assuming this is the bodyweight 1RM
    }
  };

  const listOfSets = sets.map((each, index) => <li key={index}>{each}</li>);

  return (
    <>
      <div className="text-black flex flex-col items-center background-exercise-div" id={props.id}>
        <section className="w-[100%] grid grid-cols-2 gap-4 row justify-between">
          {props.gifyLink && (
            <div onClick={toggleModal}>
              i
              <Modal
                closeFunction={toggleModal}
                key={props.id}
                className={modalClass}
                gif={props.gifyLink}
                targetMuscle={props.targetMuscle}
                equip={props.equip}
                title={props.title}
              />
            </div>
          )}
          <div>
            <h2 className="bold text-start">{props.title}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              className="mb-2 text-sm font-small text-gray-900 w-[10vw] lbs-input"
              placeholder={weightInputPlaceholder}
              value={weightInput}
              onChange={(e) => equationSetWeight(e.target.value)}
            ></input>
            <input
              className="mb-2 text-sm font-small text-gray-900 w-[10vw] reps-input"
              placeholder={repsInputPlaceholder}
              value={repsInput}
              onChange={(e) => equationSetReps(e.target.value)}
            ></input>
            <button className="submitRep" type="submit" onClick={setInfo}>
              Go
            </button>
          </div>
        </section>
        <section className="flex text-end">
          <ul className="flex flex-row justify-end">{listOfSets}</ul>
        </section>
      </div>
    </>
  );
};
