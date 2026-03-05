const express = require('express');
const {
  createMedicine,
  listMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listMedicines);
router.get('/:id', getMedicineById);
router.post('/', roleMiddleware('admin'), createMedicine);
router.put('/:id', roleMiddleware('admin'), updateMedicine);
router.delete('/:id', roleMiddleware('admin'), deleteMedicine);

module.exports = router;
