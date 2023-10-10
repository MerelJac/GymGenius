import React from "react";
import { useNavigate } from "react-router-dom";


export const NotFound = () => {
const navigate = useNavigate();
return (
<>
<p>Nothing to see here!</p>
<button className="small-footer" onClick={() => {navigate("/login")}}>
Login here.
</button>
</>
);
};
