// Define an object to store exercises by body part
const exercisesByBodyPart = {
  upper: [],
  lower: [],
  cardio: [],
  core: [],
};

export async function fetchExerciseAPIData() {
  const url = "https://exercisedb.p.rapidapi.com/exercises";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "d57e87ede7msh9a81c97580ed5c7p16ceccjsnb1fa77ee9075",
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    for (let i = 0; i < result.length; i++) {
      const exercise = {
        name: result[i].name,
        equip: result[i].equipment,
        target: result[i].target,
        link: result[i].gifUrl,
      };

      switch (result[i].bodyPart) {
        case "back":
        case "chest":
        case "upper arms":
        case "shoulders":
        case "lower arms":
          exercisesByBodyPart.upper.push(exercise);
          break;
        case "upper legs":
        case "lower legs":
          exercisesByBodyPart.lower.push(exercise);
          break;
        case "cardio":
          exercisesByBodyPart.cardio.push(exercise);
          break;
        case "waist":
          exercisesByBodyPart.core.push(exercise);
          break;
        default:
          break;
      }
    }
    return exercisesByBodyPart || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
