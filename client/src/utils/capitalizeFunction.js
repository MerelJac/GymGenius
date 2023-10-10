export const capitalizeFunction = (string) => {
    const givenString = string.split(" ");
    // empty array for words
    let capitalizedArray = [];
    givenString.forEach((word) => {
      let capitazlieEach = word.charAt(0).toUpperCase() + word.slice(1);
      capitalizedArray.push(capitazlieEach);
    });
    // return as a string value
    return capitalizedArray.join(" ");
}