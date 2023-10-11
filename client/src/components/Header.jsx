import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// TODO should include user info eventally

// TODO - get inital from logged in user. only show account if logged in is true



export const Header = (props) => {
  const navigate = useNavigate();
  const [userInital, setUserInital] = useState('')
  const returnHome = () => {
    navigate("/");
  };

  useEffect(() => {
    const username = localStorage.getItem('username')
    console.log('username', username)

    setUserInital(username.charAt(0))
  }, [])


  return (
    <>
      <div className="header">
        <h1 onClick={returnHome}>
          Gym<span className="bold">Genius</span>
        </h1>
        <div className="relative flex flex-col items-center">
          {(props.auth === true) && (
            <>
              <button
                onClick={() => {navigate('/account-info')}}
                className="flex items-center justify-center  
        h-12 w-12 rounded-full bg-gray-600 account"
              >
               {userInital}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};