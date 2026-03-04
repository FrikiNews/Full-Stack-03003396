const express = require('express');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', authorizeRoles('admin', 'empleado'), createBook);
router.put('/:id', authorizeRoles('admin', 'empleado'), updateBook);
router.delete('/:id', authorizeRoles('admin'), deleteBook);

module.exports = router;
