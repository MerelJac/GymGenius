import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, user } from "../App";
// TODO should include user info eventally

// TODO - get inital from logged in user. only show account if logged in is true


export const Header = (props) => {
  const navigate = useNavigate();
  const [userInital, setUserInital] = useState('')
  const returnHome = () => {
    navigate("/home");
  };

  useEffect(() => {
      setUserInital(localStorage.getItem('username') || "");
  }, [])


  return (
    <>
      <div className="header p-4">
        <h1 onClick={returnHome}>
          Gym<span className="bold">Genius</span>
        </h1>
        <div className="relative flex flex-col items-center">
          {(props.auth === true) && (
            <>
              <button
                onClick={() => {navigate('/account-info')}}
                className="flex items-center justify-center  
        h-12 w-12 rounded-full bg-white opacity-70 text-black"
              >
               {userInital ? userInital.charAt(0) : ""}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
