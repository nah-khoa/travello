const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');

router.get('/', promoController.getAllPromos);
router.post('/', promoController.createPromo);
router.put('/:id', promoController.updatePromo);
router.patch('/:id/toggle', promoController.toggleStatus);
router.delete('/:id', promoController.deletePromo);

// Route kiểm tra và áp dụng mã thực tế
router.post('/validate-apply', promoController.validateAndApplyPromo);

// Route tạo dữ liệu mẫu nhanh
router.post('/seed', promoController.seedSamplePromos);

module.exports = router;