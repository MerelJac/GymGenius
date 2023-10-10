import React from "react";

export const Suggestion = (props) => {
    return (
        <>
        <div className="flex flex-row">
        <p>{props.label}</p>
        <p>{props.suggestion}</p>
        </div>
        </>
    )
}