const express = require('express');
const {
  listTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  syncToFile
} = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', listTasks);
router.post('/', validateTask, createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);
router.post('/sync/file', syncToFile);

module.exports = router;
