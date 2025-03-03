const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
  },

  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "productSchema",
        required: true,
      },
    },
  ],
  user: { type: mongoose.Schema.ObjectId, ref: "userSchema", required: true }, // This must match the name you used in mongoose.model() for User

  paymentInfo: {
    id: { type: String, required: true },
    status: { type: String, required: true },
  },

  paidAt: { type: Date, required: true },
  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  orderStatus: { type: String, required: true, default: "Processing" },
  deliveredAt: Date,
  createdAt: { type: Date, required: true, default: Date.now() },
});

module.exports = mongoose.model("orderSchema", orderSchema);
