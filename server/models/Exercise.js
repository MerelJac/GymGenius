const { Schema, model } = require("mongoose");

const exerciseSchema = new Schema(
  {
    userID: {
      type: String,
    },
    full_name: {
      type: String,
      unique: true,
    },
    parsed_name: {
      type: Array,
    },
    one_rep_max: {
      type: Number,
    },
    search_name: {
      type: String,
    },
  },
  {
    toJSON: {
      getters: true,
    },
    collection: "Exercise",
  }
);

// initalize
const Exercise = model("Exercise", exerciseSchema);

// error handling
const handleError = (err) => console.log(err);

// seed?
Exercise.create({
  userID: 3,
  full_name: "Back Squat",
  parsed_name: ["Back", "Squat"],
  one_rep_max: 165,
})
  .then((result) => console.log("New exercise log: ", result))
  .catch((err) => handleError(err));

//export
module.exports = Exercise;
