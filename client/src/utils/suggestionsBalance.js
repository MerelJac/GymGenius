export const suggestionsBalance = (array) => {
  // given array of exercises for one user
  const balanceArray = ["Single", "Alternating", "Reciprocating", "Unilateral"];
  // for each item in this array, count number of instances of these strings in the array and sort the balanceArray by most frequent to least

  const balanceCount = {};

  balanceArray.forEach((grip) => {
    balanceCount[grip] = 0;
  });

  array.forEach((exercise) => {
    if (exercise) {
      const words = exercise.split(" ");
      // Loop through the words and check if they match any grips
      words.forEach((word) => {
        if (balanceArray.includes(word)) {
          balanceCount[word]++;
        }
      });
    }
  });

  balanceArray.sort((a, b) => balanceCount[a] - balanceCount[b]);
  return balanceArray;
};


