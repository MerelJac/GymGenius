import { capitalizeFunction } from "./capitalizeFunction";


export const searchFunction = async (searchTerm) => {
    try {
        let result = capitalizeFunction(searchTerm);
        let searchTitle = result.replace(/\s/g, "");
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: searchTitle }),
        };
        const response = await fetch(`http://localhost:3002/api/exercise/${searchTitle}`, requestOptions)

        const data = await response.json()
          if (data.message === 'Yes') {
              console.log(data.exercise.full_name, data.exercise.one_rep_max, data.exercise) 
              return data.exercise
          } else if (data.message === 'No') {
              console.log('Nope') 
              return false
          } else {
              console.log('Something went wrong') 
              return 'There was an error'
          }
    

    } catch (err) {console.error(err)}


};
