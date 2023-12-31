import React, { useEffect, useState } from "react";
import { fetchExerciseAPIData } from "../utils/randomWorkoutAPI";
import { ExerciseDiv } from "./ExerciseDiv";
import { useNavigate } from "react-router-dom";

export const RandomGenerator = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [arrayOfExercises, setArrayOfExercises] = useState([]);
  const [arrayOfUpdatedOneRepMaxes, setArrayOfUpdatedOneRepMaxes] = useState(
    []
  );
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("id");
    setUserId(userId);
  }, []);

  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  const fetchAndProcessExercises = async (option) => {
    try {
      const data = await fetchExerciseAPIData(option);
      let limitedExercises;

      switch (option) {
        case "upper":
          limitedExercises = shuffleArray(data.upper).slice(0, 8);
          break;
        case "lower":
          limitedExercises = shuffleArray(data.lower).slice(0, 8);
          break;
        case "full":
          const allExercises = [...data.upper, ...data.lower, ...data.core];
          limitedExercises = shuffleArray(allExercises).slice(0, 8);
          break;
        default:
          return;
      }

      const exercisePromises = limitedExercises.map((exercise) =>
        fetchAndProcessExercise(exercise)
      );

      Promise.all(exercisePromises).then((exerciseDivs) => {
        setArrayOfExercises(exerciseDivs);
      });
    } catch (error) {
      console.error("Error fetching exercise data:", error);
    }
  };

  const fetchAndProcessExercise = async (exercise) => {
    let sanitizeName;
    if (exercise.name.includes("(female)")) {
      sanitizeName = exercise.name.replace("(female)", "");
    } else if (exercise.name.includes("(male)")) {
      sanitizeName = exercise.name.replace("(male)", "");
    } else if (exercise.name.includes("(back pov)")) {
      sanitizeName = exercise.name.replace("(back pov)", "");
    } else if (exercise.name.includes("(side pov)")) {
      sanitizeName = exercise.name.replace("(side pov)", "");
    } else {
      sanitizeName = exercise.name;
    }
    const saveItem = exercise;
    const parsed_name = sanitizeName.split(" ");
    const searchTitle = sanitizeName.replace(/\s/g, "");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: searchTitle }),
    };

    try {
      const response = await fetch(
        `/api/exercise/${searchTitle}`,
        requestOptions
      );

      const data = await response.json();

      if (data.message === "Yes") {
        return (
          <ExerciseDiv
            passData={passData}
            key={data.exercise.id}
            gifyLink={saveItem.link}
            equip={saveItem.equip}
            targetMuscle={saveItem.target}
            id={data.exercise.id}
            title={data.exercise.full_name}
            oneRepMax={data.exercise.one_rep_max}
          />
        );
      } else if (data.message === "No") {
        const newExercise = {
          full_name: sanitizeName,
          parsed_name: parsed_name,
          search_name: searchTitle,
          one_rep_max: 0,
          userID: userId,
        };

        const createdExercise = await createExercise(newExercise);

        return (
          <ExerciseDiv
            passData={passData}
            key={createdExercise.id}
            gifyLink={saveItem.link}
            equip={saveItem.equip}
            targetMuscle={saveItem.target}
            id={createdExercise.id}
            title={createdExercise.full_name}
            oneRepMax={createdExercise.one_rep_max}
          />
        );
      } else {
        console.log("error");
        return null;
      }
    } catch (error) {
      console.error("Error fetching exercise data:", error);
      return null;
    }
  };

  const createExercise = async (exercise) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exercise),
    };

    try {
      const response = await fetch(
        "/api/exercise",
        requestOptions
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  const passData = (data) => {
    const id = data.id;
    const update1RM = data.new1RM;
    setArrayOfUpdatedOneRepMaxes((arrayOfUpdatedOneRepMaxes) => [
      ...arrayOfUpdatedOneRepMaxes,
      { id, update1RM },
    ]);
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

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const saveWorkout = () => {
    putWorkout(arrayOfUpdatedOneRepMaxes);
    navigate("/home");
  };

  useEffect(() => {
    if (selectedOption) {
      fetchAndProcessExercises(selectedOption);
    }
  }, [selectedOption]);

  return (
    <>
      <section>
        <h2 className="right-align flex justify-center">
          Whatcha<span className="bold">Workin?</span>
        </h2>
        <form className="flex justify-center flex-row">
          <label>
            <input
              type="radio"
              value="upper"
              checked={selectedOption === "upper"}
              onChange={handleOptionChange}
            />
            Upper Body
          </label>
          <label>
            <input
              type="radio"
              value="lower"
              checked={selectedOption === "lower"}
              onChange={handleOptionChange}
            />
            Lower Body
          </label>
          <label>
            <input
              type="radio"
              value="full"
              checked={selectedOption === "full"}
              onChange={handleOptionChange}
            />
            Full Body
          </label>
        </form>
      </section>

      <section className="p-4">{arrayOfExercises}</section>
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
