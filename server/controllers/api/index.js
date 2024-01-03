const router = require("express").Router();

import userRoutes from "./user-routes";
import exerciseRoutes from './exercise-routes';

router.use("/user-routes", userRoutes);
router.use("/exercise", exerciseRoutes)

// module.exports = router;;
module.exports = router;
export * from './user-routes.js';
export * from './exercise-routes.js';