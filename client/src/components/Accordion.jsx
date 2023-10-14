import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

export const DefaultAccordion = (props) => {
  console.log(props)
  const [open, setOpen] = React.useState(1);
  const [bench, setBench] = useState("")

  useEffect(() => {
    setBench(props.bench);
  }, [props.bench]);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <>
      <Accordion open={open === 1}>
        <AccordionHeader onClick={() => handleOpen(1)}>
          Bench Variations {props.bench}
        </AccordionHeader>
        <AccordionBody>bench {bench}</AccordionBody>
      </Accordion>
      <Accordion open={open === 2}>
        <AccordionHeader onClick={() => handleOpen(2)}>
          Grip Variation
        </AccordionHeader>
        <AccordionBody>{props.grip}</AccordionBody>
      </Accordion>
      <Accordion open={open === 3}>
        <AccordionHeader onClick={() => handleOpen(3)}>
          Balance Variation
        </AccordionHeader>
        <AccordionBody>{props.balance}</AccordionBody>
      </Accordion>
    </>
  );
};
