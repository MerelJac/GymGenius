import React, { useEffect, useState } from "react";

export const AllPrograms = (props) => {
  // use state to gather exercise divs?
  const [programs, setPrograms] = useState([])
  // use effect to call database?

  useEffect(() => {
    getAllPrograms();
  }, []);

  const getAllPrograms = () => {
    fetch(`/api/program`)
      .then((response) => response.json)
      .then((data) => {
        console.log(data)
        setPrograms(data)
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <h2>Select Program</h2>
      <div>
        {/* <ul>
          {programs.map((program) =>  (
            <li key={program.id}>{program.title}</li>
          ))}
        </ul> */}
      </div>
    </>
  );
};
