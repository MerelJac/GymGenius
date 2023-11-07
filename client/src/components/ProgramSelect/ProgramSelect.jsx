import React from "react";
import { useNavigate } from "react-router-dom";

export const ProgramSelect = (props) => {
    const navigate = useNavigate()
    const goToProgram = (id) => {
        navigate(`/start-program/${id}`)
    }
  return (
    <div
      className="background-exercise-div text-black flex flex-col items-center px-4 py-2 my-2"
      key={props.id}
    >
      <section className="w-full">
        <div className="flex flex-row gap-4 justify-between">
          <div className="flex flex-row justify-start">
            <div className="grid grid-cols-1">
              <h2 className="bold text-start break-words flex justify-end">
                {props.title}
              </h2>
            </div>
          </div>
          <button onClick={() => goToProgram(props.id)}>Go</button>
        </div>
      </section>
    </div>
  );
};
