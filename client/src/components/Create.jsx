import React, { useState, useEffect } from "react";
import { ExerciseDiv } from "./ExerciseDiv";
import { capitalizeFunction } from "../utils/capitalizeFunction";
import { useNavigate } from "react-router-dom";

export const Create = () => {
  const [exerciseDivs, setExerciseDivs] = useState([]);
  const [userId, setUserId] = useState('')
  const navigate = useNavigate()
  const [arrayOfUpdatedOneRepMaxes, setArrayOfUpdatedOneRepMaxes] = useState([])
  // global variable
  let newExerciseDiv;
  const userIdLocal = localStorage.getItem('id')

  useEffect(() => {
    const userId = localStorage.getItem('id')
    setUserId(userId)
  }, [userId])


  const passData = (data) => {
    const id = data.id;
    const update1RM = data.new1RM;
    setArrayOfUpdatedOneRepMaxes((arrayOfUpdatedOneRepMaxes) => [...arrayOfUpdatedOneRepMaxes, { id, update1RM }]);
  };

  const searchFunction = (e) => {
    e.preventDefault()
    // find elements
    const searchBar = document.querySelector("#create-search");
    let searchValue = searchBar.value;
    // reset search bar
    searchBar.value = "";
    searchBar.placeholder = "Search";
    // run capitalize
    let title = capitalizeFunction(searchValue);
    let parsed_name = title.split(" ");
    let searchTitle = title.replace(/\s/g, "");
    // query DB for exercise
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: searchTitle, userIdNumber: userIdLocal }),
    };
    fetch(`/api/exercise/${searchTitle}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.message === "Yes") {
          newExerciseDiv = (
            <ExerciseDiv
              passData={passData}
              id={data.exercise._id}
              key={exerciseDivs.length}
              title={data.exercise.full_name}
              oneRepMax={data.exercise.one_rep_max}
            />
          );
    
          return setExerciseDivs([newExerciseDiv, ...exerciseDivs]);
        } else if (data.message === "No") {
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: title,
              parsed_name: parsed_name,
              search_name: searchTitle,
              one_rep_max: 0,
              userID: userIdLocal
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
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error)); 
    });
    console.log('completed')
  };

  const saveWorkout = () => {
    putWorkout(arrayOfUpdatedOneRepMaxes);
    navigate('/home')
  };

  return (
    <>
      <div id="start-workout" className="p-4">
        <h1 className="right-align">
          New<span className="bold">Workout</span>
        </h1>
      </div>
      <div className="flex flex-row justify-center">
      <form className="w-full px-4 py-2">
      <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-black"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="create-search"
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-900 rounded-lg bg-gray-90 focus:ring-black-500 focus:border-black-500 dark:bg-gray-700"
          placeholder="Exercise name"
          onSubmit={searchFunction}
        />
        <button
          type="submit"
          className="text-white absolute right-2.5 bottom-2.5 bg-gray-700 hover:bg-black-800 focus:ring-4 focus:outline-none focus:ring-black-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-black-600 dark:hover-bg-black-700 dark:focus-ring-black-800"
          onClick={searchFunction}
        >
          Search
        </button>
      </div>
    </form>
      </div>
<section className="p-4">
{exerciseDivs}
</section>

      <div className="flex justify-center p-4">
      <button className="small-footer bottom-div save-workout text-white bg-gray-700 hover:bg-black-800 focus:ring-4 focus:outline-none focus:ring-black-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-black-600 dark:hover-bg-black-700 dark:focus-ring-black-800" onClick={saveWorkout}>
        Save Workout
      </button></div>
    </>
  );
};
