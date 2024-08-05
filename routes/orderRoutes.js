const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  deleteOrder,
  updateOrderStatus,
} = require("../controller/orderController");
const OrderRouter = express.Router();
const { isAuthUser, authRoles } = require("../middleware/auth");

OrderRouter.route("/order/new").post(isAuthUser, newOrder);
OrderRouter.route("/orders").get(isAuthUser, myOrders);
OrderRouter.route("/order/:id").get(isAuthUser, getSingleOrder);
OrderRouter.route("/admin/orders").get(
  isAuthUser,
  authRoles("admin"),
  getAllOrders
);
OrderRouter.route("/admin/order/:id")
  .put(isAuthUser, authRoles("admin"), updateOrderStatus)
  .delete(isAuthUser, authRoles("admin"), deleteOrder);

module.exports = OrderRouter;
