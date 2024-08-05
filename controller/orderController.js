const orderSchema = require("../models/orderSchema.js");
const productSchema = require("../models/productSchema.js");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");

// create new order

exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const newOrder = await orderSchema.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    newOrder,
  });
});

// Get single order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderSchema
    .findById(req.params.id)
    .populate("user", "name email"); // Populate will get the name and email from the user id in order schema from user schema

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get all  orders - user logged in
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const orders = await orderSchema.find({ user: req.user.id });

  if (!orders) {
    return new ErrorHandler("Order not found", 404);
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get all  orders - admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await orderSchema.find();

  if (!orders) {
    return next(new ErrorHandler("Orders not found", 404));
  }

  totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    orders,
    totalAmount,
  });
});

// Order update status - admin
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const order = await orderSchema.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found", 400));
  } else if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Order is already set to Delivered", 400));
  } else if (!req.body.status) {
    return next(new ErrorHandler("Please define order status", 400));
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.productId, item.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status == "Delivered") {
    order.deliveredAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
  });
});

// Get Delete Order - admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderSchema.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Orders not found", 404));
  }

  await orderSchema.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "order deleted",
  });
});

// update stock function
async function updateStock(id, quantity) {
  const product = await productSchema.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// exports. = catchAsyncError(async (req, res, next) => {});
// exports. = catchAsyncError(async (req, res, next) => {});
