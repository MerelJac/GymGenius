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
import { suggestionTempo } from "../utils/suggestionTempo";
//get all exercises for that user, run this function with useEffect and print suggestions

export const SuggestionsComponent = () => {
  const [balance, setBalance] = useState("");
  const [grip, setGrip] = useState("");
  const [bench, setBench] = useState("");
  const [tempo, setTempo] = useState("");
  const [open, setOpen] = React.useState(1);
  const [gripText, setGripText] = useState("");
  const [balanceText, setBalanceText] = useState("");
  const [benchText, setBenchText] = useState("");
  const [tempoText, setTempoText] = useState("");

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
        setGrip(gripSuggestions[0]);
        findGripText(gripSuggestions[0]);
        const benchSuggestions = suggestionsBench(arrayForSuggestions);
        setBench(benchSuggestions[0]);
        findBenchText(benchSuggestions[0]);
        const tempoSuggestions = suggestionTempo(arrayForSuggestions);
        setTempo(tempoSuggestions[0]);
        findTempoText(tempoSuggestions[0]);
        const balanceSuggestions = suggestionsBalance(arrayForSuggestions);
        if (balanceSuggestions[0] === "Single") {
          setBalance(`Single Side`);
          setBalanceText(
            "Training one side at a time will help with some inbalances."
          );
        } else {
          setBalance(balanceSuggestions[0]);
          findBalanceText(balanceSuggestions[0]);
        }
      } catch (err) {
        console.log("error", err);
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const findBalanceText = (balance) => {
    switch (balance) {
      case "Single":
        setBalanceText(
          "Training one side at a time will help with some inbalances"
        );
        break;
      case "Alternating":
        setBalanceText("Work opposites");
        break;
      case "Reciprocating":
        setBalanceText(
          "Think alternating but like a pulley system - you'll feel it in your core, as well"
        );
        break;
      case "Unilateral":
        setBalanceText("Train one side at a time. Focus!");
        break;
      default:
        setBalanceText("");
    }
  };

  const findBenchText = (bench) => {
    switch (bench) {
      case "Decline":
        setBenchText(
          "For example, a delcine push up is when your feet are on a bench."
        );
        break;
      case "Incline":
        setBenchText(
          "For example, position the bench to slightly lean back for a chest/shoulder press and target more of the front of the shoulder."
        );
        break;
      case "Flat":
        setBenchText("Keep it classic.");
        break;
      default:
        setBenchText("");
    }
  };

  const findGripText = (grip) => {
    switch (grip) {
      case "Close":
        setGripText("Keep your hands or feet close to eachother.");
        break;
      case "Narrow":
        setGripText("Keep your hands or feet close to eachother.");
        break;
      case "Nautral":
        setGripText("Position just about shoulder width apart.");
        break;
      case "Wide":
        setGripText("Keep your hands or feet far apart!");
        break;
      case "Reverse":
        setGripText(
          "Alternative what's normal. For exaxmple: a reverse bicep curl has your palms facing the floor."
        );
        break;
      default:
        setGripText("");
    }
  };

  const findTempoText = (tempo) => {
    switch (tempo) {
      case "Eccentric":
        setTempoText(
          "Whenever you lower the move, go super slow. Increase time under tension."
        );
        break;
      case "Slow":
        setTempoText(
          "Whenever you lower the move, go super slow. Increase time under tension."
        );
        break;
      case "Pulse":
        setTempoText("Quick and small movements - feel the burn.");
        break;
      case "Nautral":
        setTempoText("Position just about shoulder width apart.");
        break;
      case "Pulsing":
        setTempoText("Quick and small movements - feel the burn.");
        break;
      default:
        setTempoText("");
    }
  };

  return (
    <>
      <Accordion open={open === 1}>
        <AccordionHeader onClick={() => handleOpen(1)}>Bench</AccordionHeader>
        <AccordionBody>
          Suggestion: {bench} Bench <br></br>
          {benchText}
        </AccordionBody>
      </Accordion>
      <Accordion open={open === 2}>
        <AccordionHeader onClick={() => handleOpen(2)}>Grip</AccordionHeader>
        <AccordionBody>
          Suggestion: {grip} Grip <br></br>
          {gripText}
        </AccordionBody>
      </Accordion>
      <Accordion open={open === 3}>
        <AccordionHeader onClick={() => handleOpen(3)}>Balance</AccordionHeader>
        <AccordionBody>
          Suggestion: {balance} <br></br>
          {balanceText}
        </AccordionBody>
      </Accordion>
      <Accordion open={open === 4}>
        <AccordionHeader onClick={() => handleOpen(4)}>Tempo</AccordionHeader>
        <AccordionBody>
          Suggestion: {tempo} <br></br>
          {tempoText}
        </AccordionBody>
      </Accordion>
    </>
  );
};
