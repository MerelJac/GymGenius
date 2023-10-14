import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { getAllExercisesForOneUser } from "../utils/searchFunctionAllExercises";
import { suggestionsGrip } from "../utils/suggestionsGrip";
import { suggestionsBench } from "../utils/suggestionsBench";
import { suggestionsBalance } from "../utils/suggestionsBalance";
//get all exercises for that user, run this function with useEffect and print suggestions

export const SuggestionsComponent = () => {
  const [balance, setBalance] = useState("");
  const [grip, setGrip] = useState("");
  const [bench, setBench] = useState("");
  const [open, setOpen] = React.useState(1);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  useEffect(() => {
    // get all exercises from the user
    const fetchData = async () => {
      try {
        const getAllExerciseData = await getAllExercisesForOneUser();
        let arrayForSuggestions = [];
        getAllExerciseData.forEach((element) => {
          arrayForSuggestions.push(element.full_name);
        });
        const gripSuggestions = suggestionsGrip(arrayForSuggestions);
        console.log(gripSuggestions[0])
        setGrip(gripSuggestions[0]);
        const benchSuggestions = suggestionsBench(arrayForSuggestions);
        setBench(benchSuggestions[0]);
        const balanceSuggestions = suggestionsBalance(arrayForSuggestions);
        if (balanceSuggestions[0] === "Single") {
          setBalance(`Single Side`);
        } else {
          setBalance(balanceSuggestions[0]);
        }
      } catch (err) {
        console.log('error', err)
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Accordion open={open === 1}>
        <AccordionHeader onClick={() => handleOpen(1)}>
          Bench
        </AccordionHeader>
        <AccordionBody>Suggestion: {bench} Bench <br></br>
        Sit back, relax, and your incline bench will kick your ass. Elevate your toes in a squat or deadlift. The options are endless. 
        </AccordionBody>
      </Accordion>
      <Accordion open={open === 2}>
        <AccordionHeader onClick={() => handleOpen(2)}>
          Grip
        </AccordionHeader>
        <AccordionBody>Suggestion: {grip} Grip <br></br>
        Try a bicep curl with your palms facing the floor (reverse grip) or a chest press with your hands really close together (close grip). Feel the difference & keep checking your suggestions. 
        </AccordionBody>
      </Accordion>
      <Accordion open={open === 3}>
        <AccordionHeader onClick={() => handleOpen(3)}>
          Balance
        </AccordionHeader>
        <AccordionBody>Suggestion: {balance} <br></br>
        Strengthen your balance and stability by working one side of your body at a time, or balancing on one leg. This will help strengthen your ankles and prevent risk of injury over time. 
        </AccordionBody>
      </Accordion>
      <Accordion open={open === 4}>
        <AccordionHeader onClick={() => handleOpen(4)}>
          Tempo
        </AccordionHeader>
        <AccordionBody><span className="font-bold">Slowww</span>: Have you tried going really slow on the way down? You can gain a lot of strengh if you control the lowering of the weight. Example: slowly squat down or slowly lower the bicep curl. It's called 'Eccentric'!<br></br>
        <span className="font-bold">Speed it the f*** up: </span>Add some power & feel the burn!
        </AccordionBody>
      </Accordion>
    </>
  );
};
