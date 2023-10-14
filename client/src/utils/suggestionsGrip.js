export const suggestionsGrip = (array) => {
  // given array of exercises for one user
  const gripArray = ["Close", "Neutral", "Wide", "Reverse"];
  // for each item in this array, count number of instances of these strings in the array and sort the gripArray by most frequent to least
  
  const gripCounts = {};

  gripArray.forEach((grip) => {
    gripCounts[grip] = 0;
  });


    

  array.forEach((exercise) => {
    if (exercise) {
    const words = exercise.split(' ');
    // Loop through the words and check if they match any grips
    words.forEach((word) => {
      if (gripArray.includes(word)) {
        gripCounts[word]++;
      }
    });
  }
  });

gripArray.sort((a,b) => gripCounts[a] - gripCounts[b])
return gripArray
};




