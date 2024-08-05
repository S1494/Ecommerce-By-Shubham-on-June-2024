const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  deleteReview,
} = require("../controller/productcontroller");

const { isAuthUser, authRoles } = require("../middleware/auth");

router.route("/products").get(getAllProducts);

router
  .route("/admin/products/new")
  .post(isAuthUser, authRoles("admin"), createProduct);

router
  .route("/admin/products/:id")
  .put(isAuthUser, authRoles("admin"), updateProduct) // Changed post to put for updating the product
  .delete(isAuthUser, authRoles("admin"), deleteProduct) // Added admin role check here as well
  .get(getProductDetails);

router
  .route("/review")
  .put(isAuthUser, createProductReview)
  .delete(isAuthUser, deleteReview);

module.exports = router;
