const { Schema, model } = require("mongoose");

const programSchema = new Schema({
  program_id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
  },
  workouts: {
    type: Array,
  },
});

const Programs = model("Programs", programSchema);

Programs.create({
  program_id: "6548604831fdb24902aa00b6",
  title: "Fall Back",
  workouts: [
    {
      day_1: ["Barbell Hip Thrusts", "High Plank Mountain Climbers", "Heels Elevated Front Squats", "Lateral Lunge to Balance"]
    },
    {
      day_2: ["Barbell Hip Thrusts", "High Plank Mountain Climbers", "Heels Elevated Front Squats", "Lateral Lunge to Balance"]
    }
  ],
})
  .then((result) => console.log("Program 1 seeded", result))
  .catch((err) => console.error(err));

module.exports = Programs;
