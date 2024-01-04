export const suggestionTempo = (array) => {
    // given array of exercises for one user
    const tempoArray = ["Eccentric", "Slow", "Pulse", "Pulsing"];
    // for each item in this array, count number of instances of these strings in the array and sort the tempoArray by most frequent to least
    
    const tempoCounts = {};
  
    tempoArray.forEach((grip) => {
      tempoCounts[grip] = 0;
    });
  
    array.forEach((exercise) => {
      if (exercise) {
      const words = exercise.split(' ');
      // Loop through the words and check if they match any grips
      words.forEach((word) => {
        if (tempoArray.includes(word)) {
          tempoCounts[word]++;
        }
      });
    }
    });
  
  tempoArray.sort((a,b) => tempoCounts[a] - tempoCounts[b])
  return tempoArray
  };
  
  
  
  
  