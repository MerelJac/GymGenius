export const suggestionsBench = (array) => {
    // given array of exercises for one user
    const benchArray = ["Decline", "Incline", "Flat"];
    // for each item in this array, count number of instances of these strings in the array and sort the benchArray by most frequent to least
    
    const benchCount = {};
  
    benchArray.forEach((grip) => {
      benchCount[grip] = 0;
    });
  
    array.forEach((exercise) => {
      const words = exercise.split(' ');
      // Loop through the words and check if they match any grips
      words.forEach((word) => {
        if (benchArray.includes(word)) {
          benchCount[word]++;
        }
      });
    });
  
  benchArray.sort((a,b) => benchCount[a] - benchCount[b])
  return benchArray
  };
  
  
  
  
  