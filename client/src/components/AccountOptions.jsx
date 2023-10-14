import React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export const AccountOptions = (props) => {
  const [open, setOpen] = React.useState(1);
  const navigate = useNavigate();

  const logout = () => {
    // destroy stored token
    localStorage.clear();
    // return to login page
    navigate("/login");
  };
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <>
    <div className="p-4">
      <Accordion open={open === 1}>
        <AccordionHeader onClick={() => handleOpen(1)}>Logout</AccordionHeader>
        <AccordionBody>
          <button onClick={logout}>See you soon!</button>
        </AccordionBody>
      </Accordion>
      </div>
    </>
  );
};
