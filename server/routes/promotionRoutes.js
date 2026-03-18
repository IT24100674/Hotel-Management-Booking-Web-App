const express = require('express');
const router = express.Router();
const {
    getAllPromotions,
    getActivePromotionsByType,
    createPromotion,
    deletePromotion,
    togglePromotionStatus,
    updatePromotion
} = require('../controllers/promotionController');

const upload = require('../middleware/upload');

router.get('/', getAllPromotions);
router.get('/active/:type', getActivePromotionsByType);
router.post('/', upload.single('image'), createPromotion);
router.put('/:id', upload.single('image'), updatePromotion);
router.delete('/:id', deletePromotion);
router.patch('/:id/status', togglePromotionStatus);

module.exports = router;
