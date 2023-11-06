const User = require('./User');
const Exercise = require('./Exercise')
const Programs = require('./Programs') 

// User has many workouts
// 
module.exports = { User, Exercise, Programs }