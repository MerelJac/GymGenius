export const getAllExercisesForOneUser = async () => {
  try {
    const response = await fetch(`/api/exercise/`);

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
