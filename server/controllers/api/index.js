const router = require("express").Router();

const userRoutes = require("./user-routes");
const exerciseRoutes = require('./exercise-routes')
const programRoutes = require('./program-routes')

router.use("/user-routes", userRoutes);
router.use("/exercise", exerciseRoutes)
router.use("/program", programRoutes)

module.exports = router;