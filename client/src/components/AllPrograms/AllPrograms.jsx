import React, { useEffect, useState } from "react";
import { ProgramSelect } from "../ProgramSelect/ProgramSelect";

export const AllPrograms = (props) => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    getAllPrograms();
  }, []);

  const getAllPrograms = () => {
    fetch(`/api/program`)
      .then((response) => response.json())
      .then((data) => {
        const newPrograms = data.map((element) => (
          <ProgramSelect title={element.title} id={element.program_id} />
        ));
        setPrograms(newPrograms);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h2>Select Program</h2>
      <div>
        <ul>
          {programs.map((program) => (
            <li key={program.length}>{program}</li>
          ))}
        </ul>
      </div>
    </>
  );
};
