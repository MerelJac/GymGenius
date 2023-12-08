import React, { useState } from "react";

export const DropdownMenu = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  return (
    <>
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
        onClick={toggleDropdown}
      >
        Dropdown button{" "}
      </button>
      {/* Dropdown Menu */}
      <div
        id="dropdown"
        className={`z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${
          showDropdown ? "block" : "hidden"
        }`}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          <li>
            <button className="block px-4 py-2 hover:bg-gray-100">
              Dashboard
            </button>
          </li>
          <li>
            <button href="#" className="block px-4 py-2 hover:bg-gray-100">
              Settings
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};
