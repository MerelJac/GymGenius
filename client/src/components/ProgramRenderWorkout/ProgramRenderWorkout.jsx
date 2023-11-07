import React, { useEffect, useState } from "react";
import { ExerciseDiv } from "../ExerciseDiv";
import { useNavigate, useParams } from "react-router-dom";

export const ProgramRenderWorkouts = () => {
  const { id } = useParams();
  const [arrayOfUpdatedOneRepMaxes, setArrayOfUpdatedOneRepMaxes] = useState([])
  const [userId, setUserId] = useState("");
  const [exerciseDivs, setExerciseDivs] = useState([])
  const navigate = useNavigate();
  let newExerciseDiv;

  useEffect(() => {
    const userId = localStorage.getItem("id");
    setUserId(userId);
    findProgram(id);
  }, [id]);

  const findProgram = (id) => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };
      fetch(`/api/program/${id}`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          const workoutData = data.data.workouts;
          queryWorkout(workoutData);
          // for each exercise , either new or create
          // push to array
          // render array in div
        });
    } catch (err) {
      console.error(err);
    }
  };

  const queryWorkout = (workoutArray) => {
    Object.keys(workoutArray).forEach((key) => {
      console.log(`key: ${key}, value: ${workoutArray[key]}`);
      let title = JSON.stringify(workoutArray[key]);
      console.log(title)
      console.log(typeof(title))
      let searchName = title.replace(/\s/g, "");
      searchDbForTitle(searchName, title);

      if (typeof workoutArray[key] === "object" && workoutArray[key] !== null) {
        queryWorkout(workoutArray[key]);
      }
    });
  };

  // add user to this query
  const searchDbForTitle = (string, title) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: string }),
    };

    try {
      fetch(`/api/exercise/${string}`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.message === "Yes") {
            newExerciseDiv = (
              <ExerciseDiv
                passData={passData}
                id={data.exercise._id}
                key={data.length}
                title={data.exercise.full_name}
                oneRepMax={data.exercise.one_rep_max}
              />
            );
            return setExerciseDivs([ newExerciseDiv, ...exerciseDivs])
          } else if (data.message === 'No') {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  full_name: title,
                  search_name: string,
                  one_rep_max: 0,
                  userID: userId,
                }),
              };
              fetch("/api/exercise", requestOptions)
              .then((response) => response.json())
              .then((data) => {
                newExerciseDiv = (
                  <ExerciseDiv
                    passData={passData}
                    id={data._id}
                    key={exerciseDivs.length}
                    title={title}
                    oneRepMax={data.one_rep_max}
                  />
                );
                return setExerciseDivs([newExerciseDiv, ...exerciseDivs]);
              }); 
          }
        });
    } catch (err) {
      console.error(err);
    }
  };
  // query DB for exercise

    const passData = (data) => {
        const id = data.id;
        const update1RM = data.new1RM;
        setArrayOfUpdatedOneRepMaxes((arrayOfUpdatedOneRepMaxes) => [...arrayOfUpdatedOneRepMaxes, { id, update1RM }]);
      };

  const putWorkout = async (array) => {
    await array.forEach((object) => {
      const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(object),
      };
      fetch(`/api/exercise/${object.id}`, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        // .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    });
  };

  const saveWorkout = () => {
    putWorkout();
    navigate("/home");
  };

  return (
    <>
      <section>
        <h2 className="right-align flex justify-center">
          Program<span className="bold">Title</span>
        </h2>
        <p>day?</p>
      </section>

      <section className="p-4">{exerciseDivs}</section>
      <div className="flex justify-center">
        <button
          className="small-footer bottom-div save-workout text-white bg-gray-700 hover:bg-black-800 focus:ring-4 focus:outline-none focus:ring-black-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-black-600 dark:hover-bg-black-700 dark:focus-ring-black-800"
          onClick={saveWorkout}
        >
          Save Workout
        </button>
      </div>
    </>
  );
};
