export const getAllExercisesForOneUser = async () => {
  try {
    const response = await fetch(`http://localhost:3002/api/exercise/`);

    const data = await response.json();
    if (data) {
      return data;
    } else {
      console.log("Something went wrong");
      return "There was an error";
    }
  } catch (err) {
    console.error(err);
  }
};
