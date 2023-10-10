import { React, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AccountInfo = () => {
  const navigate = useNavigate();
  const [showField, setShowDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  // cons [newName, setNewName] = useState("");


  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  // const handleNameChange = (e) => {
  //   setNewName(e.target.value);
  // };

  const handleUpdate = () => {
    // Perform update operation using GraphQL mutation (to be implemented later)
    // For now, just log the updated password and name
    console.log("updated pw");
    console.log("updated user");
    navigate("/");

       // Show on-screen alert after navigation
       setTimeout(() => {
        alert("Password and user details changed!");
      }, 0);
  
      // Clear form fields and close the dialog
      setNewPassword("");
      // setNewName("");
      setShowDialog(false);

  };

  const logout = () => {
    // destroy stored token
    localStorage.clear();
    // return to login page
    navigate("/login");
  };

  return (
    <>
      <button onClick={logout}>Log Out</button>

      <h2>Account Information</h2>

      {/* Button to open the dialog */}
      <button onClick={() => setShowDialog(true)}>Change Options</button>

      {/* Dialog */}
      {showField && (
        <div className="dialog">
          <h3>Update Account Information</h3>
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <label htmlFor="newName">New Name:</label>
            <input
              type="text"
              id="newName"
              // value={newName}
              // onChange={handleNameChange}
            />
          </div>
          <button onClick={handleUpdate}>Update</button>
          {/* Button to close the dialog */}
          <button onClick={() => setShowDialog(false)}>Cancel</button>
        </div>
      )}
    </>
  );
};







