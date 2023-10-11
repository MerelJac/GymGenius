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

  useEffect(() => {
    const userId = localStorage.getItem('id')
    console.log(userId)
    setUserId(userId)
  }, [userId])


  const passData = (data) => {
    const id = data.id;
    const update1RM = data.new1RM;
    setArrayOfUpdatedOneRepMaxes((arrayOfUpdatedOneRepMaxes) => [...arrayOfUpdatedOneRepMaxes, { id, update1RM }]);
  };

  const searchFunction = (e) => {
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
      body: JSON.stringify({ title: searchTitle }),
    };
    fetch(`http://localhost:3002/api/exercise/${searchTitle}`, requestOptions)
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
              userID: userId
            }),
          };
          fetch("http://localhost:3002/api/exercise", requestOptions)
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
      fetch(`http://localhost:3002/api/exercise/${object.id}`, requestOptions) 
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
    navigate('/')
  };

  return (
    <>
      <div id="start-workout">
        <h1 className="right-align">
          New<span className="bold">Workout</span>
        </h1>
      </div>
      <div className="flex flex-row justify-center">
        <input
          id="create-search"
          type="search"
          placeholder="Search"
          onSubmit={searchFunction}
        ></input>
        <button onClick={searchFunction}>Search</button>
      </div>
      {exerciseDivs}
      <div className="flex justify-center">
      <button className="small-footer bottom-div save-workout" onClick={saveWorkout}>
        Save Workout
      </button></div>
    </>
  );
};
