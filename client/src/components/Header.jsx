import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/assets/css/header.css";
// TODO should include user info eventally


export const Header = (props) => {
  const navigate = useNavigate();
  const returnHome = () => {
    navigate("/");
  };

  const accountInfo = () => {
    navigate("/account-info");
  };

  const previousExercises = () => {
    navigate("/previous-exercises");
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="header p-3 mr-5">
        <h1 onClick={returnHome} id="title">
          fitness<span className="bold">Application</span>
        </h1>
        <div className="relative flex flex-col items-center">
        <button onClick={()=> setIsOpen((prev) => !prev)} className="flex items-center justify-center  
        h-12 w-12 rounded-full bg-gray-600 mr-2 mt-2 account">A</button>
        {isOpen && ( <div className="flex flex-col">
          <button className="menu-account text-sm" onClick={accountInfo}>Account</button>
          <button className="menu-saved-exercises text-sm" onClick={previousExercises}>Workouts</button>
        </div>)}
        </div>
      </div>
      
    </>
  );
};
