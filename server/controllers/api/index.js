const router = require("express").Router();

const userRoutes = require("./user-routes");
const exerciseRoutes = require('./exercise-routes')

router.use("/user-routes", userRoutes);
router.use("/exercise", exerciseRoutes)

module.exports = router;