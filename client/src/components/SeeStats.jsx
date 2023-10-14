import React from "react";
import { SearchBar } from "./SearchBox";
import { SuggestionsComponent } from "./SuggestionsComponent";




export const SeeStatsPage = () => {
    return (
        <>
        <SearchBar placeholder={"Search Exercise for 1RM"}/>

        <section className="p-4">
        <h2 className="text-lg font-bold">Exercise Suggestions:</h2>
        <SuggestionsComponent/>
        </section>
        </>
    )
}