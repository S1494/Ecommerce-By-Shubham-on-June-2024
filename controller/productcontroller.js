const productSchema = require("../models/productSchema.js");
const ErrorHandler = require("../utils/errorhandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");
const ApiFeatures = require("../utils/apifeatures.js");

exports.createProduct = catchAsyncError(async (req, res) => {
  req.body.user = req.user.id;
  console.log(req.body.user);
  const product = await productSchema.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await productSchema.countDocuments();
  console.log(`Total productCount is ${productCount}`);
  const apifeature = new ApiFeatures(productSchema.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apifeature.query;
  res.status(200).json({
    success: true,
    products,
  });
});

exports.updateProduct = catchAsyncError(async (req, res) => {
  const id = req.params.id;
  if (id.length !== 24) {
    return next(new ErrorHandler("Incorrect Product id", 404));
  }
  let product = await productSchema.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }
  product = await productSchema.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProduct = catchAsyncError(async (req, res) => {
  const id = req.params.id;
  if (id.length !== 24) {
    return next(new ErrorHandler("Incorrect Product id", 404));
  }
  const product = productSchema.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  }
  await productSchema.findByIdAndDelete(req.params.id);
  // await product.remove() is not working here

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  console.log("getProductdetails ");
  const id = req.params.id;
  const product = await productSchema.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product not Found", 404));
  } else {
    res.status(200).json({
      success: true,
      product,
    });
  }
});

exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await productSchema.findById(productId);
  console.log(product);
  const isReviewed = product.review.find((rev) => {
    rev.user == req.user.id;
  });

  if (isReviewed) {
    product.review.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.review.push(review);
    product.numOfReviews = product.review.length;
  }

  let avg = 0;
  product.rating =
    product.review.forEach((rev) => {
      avg += rev.rating;
    }) / product.review.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "review updated",
  });
});

exports.getAllRewiews = catchAsyncError(async (req, res, next) => {
  const product = await productSchema.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    review: product.review,
  });
});

exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const { productId, id } = req.query;
  const product = await productSchema.findById(productId);

  console.log(productId, id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const review = product.review.filter(
    (rev) => rev._id.toString() !== id.toString()
  );

  // console.log(reviews);

  numOfReviews = review.length;

  let ratings = 0;

  review.forEach((rev) => {
    ratings += rev.rating / numOfReviews;
  });

  updatedDetails = {
    review,
    numOfReviews,
    ratings,
  };
  console.log(updatedDetails);

  await productSchema.findByIdAndUpdate(productId, updatedDetails);

  res.status(200).json({
    success: true,
    message: "Product Deleted",
  });
});
