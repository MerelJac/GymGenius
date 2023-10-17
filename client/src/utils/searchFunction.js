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
        const response = await fetch(`/api/exercise/${searchTitle}`, requestOptions)

        const data = await response.json()
          if (data.message === 'Yes') {
              return data.exercise
          } else if (data.message === 'No') {
              return false
          } else {
              return 'There was an error'
          }
    

    } catch (err) {console.error(err)}


};
