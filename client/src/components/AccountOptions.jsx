import React,  { useContext } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";

export const AccountOptions = (props) => {
  const [open, setOpen] = React.useState(1);
  const { checkLoginState} = useContext(AuthContext)
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`/auth/logout`);
      // Check login state again
      checkLoginState();
      navigate('/login')
    } catch (err) {
      console.error(err);
    }
  }

  // const logout = () => {
  //   // destroy stored token
  //   localStorage.clear();
    
  //   // return to login page
  //   navigate("/login");
  // };

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <>
    <div className="p-4">
      <Accordion open={open === 1}>
        <AccordionHeader onClick={() => handleOpen(1)}>Logout</AccordionHeader>
        <AccordionBody>
          <button onClick={handleLogout}>See you soon!</button>
        </AccordionBody>
      </Accordion>
      </div>
    </>
  );
};
