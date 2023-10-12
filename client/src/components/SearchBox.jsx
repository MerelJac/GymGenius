import React, { useState } from "react";
import { searchFunction } from "../utils/searchFunction";
import { OneRepMaxStats } from "./FoundExerciseResult";
import { NotFoundExerciseDiv } from "./NotFoundExerciseResult";

export const SearchBar = (props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchExercise, setCurrentSearchExercise] = useState();

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const response = await searchFunction(searchTerm);
    if (response === false) {
      const notFoundSearchExercise = (
        <NotFoundExerciseDiv full_name={`Haven't hit that lift yet.`} />
      );
      setCurrentSearchExercise(notFoundSearchExercise);
    } else {
      const newSearchExercise = (
        <OneRepMaxStats
          full_name={response.full_name}
          one_rep_max={response.one_rep_max}
        />
      );
      setCurrentSearchExercise(newSearchExercise);
    }
  };

  return (
    <>
      <div className="flex flex-row justify-center">
        <form className="w-full px-4 py-2">
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
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
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-900 rounded-lg bg-gray-90 focus:ring-black-500 focus:border-black-500 dark:bg-gray-700"
              placeholder={props.placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              onSubmit={handleSearch}
            />
            <button
              type="submit"
              className="text-white absolute right-2.5 bottom-2.5 bg-gray-700 hover:bg-black-800 focus:ring-4 focus:outline-none focus:ring-black-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-black-600 dark:hover-bg-black-700 dark:focus-ring-black-800"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </form>
      </div>
      <section className="flex justify-center">{currentSearchExercise}</section>
      {/*       
      <section className="search-outline flex flex-row ">
        <input
          type="search"
          placeholder={props.placeholder}
          value={searchTerm}
          onChange={handleInputChange}
        >
        </input>
        <img className="w-2" onClick={handleSearch} alt="search-icon" />
      </section>
      <section className="flex justify-center">{currentSearchExercise}</section> */}
    </>
  );
};
