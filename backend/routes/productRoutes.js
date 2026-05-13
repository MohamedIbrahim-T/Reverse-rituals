const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  updateStockStatus,
  getLowStockProducts,
  updateProductStock,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/low-stock')
  .get(protect, admin, getLowStockProducts);

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

router.route('/:id/stock-status')
  .put(protect, admin, updateStockStatus);

router.route('/:id/stock')
  .put(protect, admin, updateProductStock);

module.exports = router;
