import React, { useEffect, useState } from "react";
// import { ExerciseDiv } from "./ExerciseDiv";
import { useNavigate, useParams } from "react-router-dom";

export const ProgramRenderWorkouts = () => {
    const { id } = useParams();
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

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
            console.log(data)
            // for each exercise , either new or create 
            // push to array 
            // render array in div 
        });
    } catch (err) {
      console.error(err);
    }
  };


//   const fetchAndProcessExercises = async (option) => {
//     try {
//       const data = await fetchExerciseAPIData(option);
//       let limitedExercises;

//       const exercisePromises = limitedExercises.map((exercise) =>
//         fetchAndProcessExercise(exercise)
//       );

//       Promise.all(exercisePromises).then((exerciseDivs) => {
//         setArrayOfExercises(exerciseDivs);
//       });
//     } catch (error) {
//       console.error("Error fetching exercise data:", error);
//     }
//   };

//   const fetchAndProcessExercise = async (exercise) => {
//     const saveItem = exercise;

//     const requestOptions = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ title: searchTitle }),
//     };

//     try {
//       const response = await fetch(
//         `/api/exercise/${searchTitle}`,
//         requestOptions
//       );

//       const data = await response.json();

//       if (data.message === "Yes") {
//         return (
//           <ExerciseDiv
//             passData={passData}
//             key={data.exercise.id}
//             gifyLink={saveItem.link}
//             equip={saveItem.equip}
//             targetMuscle={saveItem.target}
//             id={data.exercise.id}
//             title={data.exercise.full_name}
//             oneRepMax={data.exercise.one_rep_max}
//           />
//         );
//       } else if (data.message === "No") {
//         const newExercise = {
//           full_name: sanitizeName,
//           parsed_name: parsed_name,
//           search_name: searchTitle,
//           one_rep_max: 0,
//           userID: userId,
//         };

//         const createdExercise = await createExercise(newExercise);

//         return (
//           <ExerciseDiv
//             passData={passData}
//             key={createdExercise.id}
//             gifyLink={saveItem.link}
//             equip={saveItem.equip}
//             targetMuscle={saveItem.target}
//             id={createdExercise.id}
//             title={createdExercise.full_name}
//             oneRepMax={createdExercise.one_rep_max}
//           />
//         );
//       } else {
//         console.log("error");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error fetching exercise data:", error);
//       return null;
//     }
//   };

//   const createExercise = async (exercise) => {
//     const requestOptions = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(exercise),
//     };

//     try {
//       const response = await fetch("/api/exercise", requestOptions);

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error("Error creating exercise:", error);
//     }
//   };

//   const passData = (data) => {
//     const id = data.id;
//     const update1RM = data.new1RM;
//     setArrayOfUpdatedOneRepMaxes((arrayOfUpdatedOneRepMaxes) => [
//       ...arrayOfUpdatedOneRepMaxes,
//       { id, update1RM },
//     ]);
//   };

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

      <section className="p-4">test</section>
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
