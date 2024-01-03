const router = require('express').Router();

import apiRoutes from './api';

router.use('/api', apiRoutes);

module.exports = router;
export * from './api/index.js';