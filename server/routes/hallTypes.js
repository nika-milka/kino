const express = require('express');
const router = express.Router();
const hallTypeController = require('../controllers/hallTypes');

router.get('/', hallTypeController.getAllHallTypes);
router.get('/:id', hallTypeController.getHallTypeById);
router.post('/', hallTypeController.createHallType);
router.put('/:id', hallTypeController.updateHallType);
router.delete('/:id', hallTypeController.deleteHallType);

module.exports = router;