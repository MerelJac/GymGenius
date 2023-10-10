import React from "react";
import { SearchBar } from "./SearchBox";
import { SuggestionsComponent } from "./SuggestionsComponent";




export const SeeStatsPage = () => {
    return (
        <>
        <SearchBar placeholder={"Search Exercise for 1RM"}/>
        <SuggestionsComponent/>

        </>
    )
}