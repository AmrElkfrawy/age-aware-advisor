const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.post(
  '/estimate',
  healthController.uploadUserFile,
  healthController.estimateAge
);
router.post('/nutrition', healthController.nutrition);
router.post(
  '/food-calories',
  healthController.uploadUserFile,
  healthController.foodCalories
);

module.exports = router;
