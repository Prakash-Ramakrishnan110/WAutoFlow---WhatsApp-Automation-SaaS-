const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  triggerEvent
} = require('../controllers/eventController');
const { eventValidator } = require('../utils/validators');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.post('/', eventValidator, createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/trigger', triggerEvent);

module.exports = router;

