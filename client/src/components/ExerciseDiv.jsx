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
    console.log(e)
    setWeightInput(e);

  
    // Reset the repsInputPlaceholder to 'reps'
    setRepsInputPlaceholder("reps");

    let reps = (e / props.one_rep_max - 1.0278) / -0.0278;

      setRepsInputPlaceholder(Math.floor(reps));
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
      setRepsInputPlaceholder("reps");
      setWeightInputPlaceholder("lbs");
    } else {
      console.log("nothing happened");
    }
  };

  const toggleModal = () => {
    setIsShown(!isShown);
  };

  const modalClass = isShown
    ? "fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-hidden outline-none focus:outline-none transform -translate-x-1/2 left-1/2 h-[100%]"
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

  const listOfSets = sets.map((each, index) => (
    <li className="px-2" key={index}>
      {each}
    </li>
  ));

  return (
    <>
      <div
        className="background-exercise-div text-black flex flex-col items-center px-4 py-2 my-2"
        id={props.id}
      >
        <section className="w-full">
          <div className="flex flex-row gap-4 justify-between">
            <div className="flex flex-row justify-start">
              {props.gifyLink && (
                <div className="mr-4" onClick={toggleModal}>
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
              <div className="grid grid-cols-1">
                <h2 className="bold text-start break-words flex justify-end">
                  {props.title}
                </h2>
              </div>
            </div>
            <div className="flex flex-row ">
              <input
                className="ml-2 mb-2 text-sm font-small text-white text-center w-[15vw] h-[5vh]"
                placeholder={weightInputPlaceholder}
                value={weightInput}
                onChange={(e) => equationSetWeight(e.target.value)}
              ></input>
              <input
                className="ml-2 mb-2 text-sm font-small text-white text-center w-[15vw] h-[5vh]"
                placeholder={repsInputPlaceholder}
                value={repsInput}
                onChange={(e) => equationSetReps(e.target.value)}
              ></input>
              <button
                className="ml-2 mb-2 text-sm font-small text-white text-center w-[5vw] h-[5vh] submit-rep"
                type="submit"
                onClick={setInfo}
              >
                Go
              </button>
            </div>
          </div>
        </section>
        <section className="flex justify-end w-[100%]">
          <ul className="flex flex-row justify-end">{listOfSets}</ul>
        </section>
      </div>
    </>
  );
};
