const User = require("../models/User");
const Product = require("../models/Product");
const { sendSuccess, createError } = require("../utils/apiResponse");
const wrapControllers = require("../utils/wrapControllers");

const publicUserFields = "-password -isActive -passwordChangedAt";
const wishlistPopulate =
  "name brand category price discount image stock unit ratings badge badgeColor deliveryTime farm description tags";

const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select(publicUserFields)
    .populate("wishlist", wishlistPopulate);

  if (!user) {
    throw createError(404, "User not found.", "UserNotFound");
  }

  return sendSuccess(res, 200, { data: { user } });
};

const updateProfile = async (req, res) => {
  const allowed = ["name", "email", "phone"];
  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.email) {
    const existing = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: req.user.id },
    });

    if (existing) {
      throw createError(409, "An account with this email already exists.", { field: "email" });
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select(publicUserFields);

  return sendSuccess(res, 200, {
    message: "Profile updated successfully.",
    data: { user },
  });
};

const addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = {
    type: req.body.type || "Home",
    fullName: req.body.fullName || "",
    phone: req.body.phone || "",
    line1: req.body.line1,
    line2: req.body.line2 || "",
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    isDefault: Boolean(req.body.isDefault),
  };

  if (address.isDefault || user.address.length === 0) {
    user.address.forEach((item) => {
      item.isDefault = false;
    });
    address.isDefault = true;
  }

  user.address.push(address);
  await user.save();

  const freshUser = await User.findById(req.user.id).select(publicUserFields);

  return sendSuccess(res, 201, {
    message: "Address added successfully.",
    data: { user: freshUser, address: freshUser.address[freshUser.address.length - 1] },
  });
};

const removeAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = user.address.id(req.params.addressId);

  if (!address) {
    throw createError(404, "Address not found.", { field: "addressId" });
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  if (wasDefault && user.address.length > 0) {
    user.address[0].isDefault = true;
  }

  await user.save();

  const freshUser = await User.findById(req.user.id).select(publicUserFields);

  return sendSuccess(res, 200, {
    message: "Address removed successfully.",
    data: { user: freshUser },
  });
};

const getWishlist = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("wishlist")
    .populate("wishlist", wishlistPopulate);

  return sendSuccess(res, 200, { data: { wishlist: user.wishlist || [] } });
};

const addToWishlist = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });

  if (!product) {
    throw createError(404, "Product not found or unavailable.", { field: "productId" });
  }

  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { wishlist: product._id },
  });

  const user = await User.findById(req.user.id).select("wishlist").populate("wishlist", wishlistPopulate);

  return sendSuccess(res, 200, {
    message: `"${product.name}" added to wishlist.`,
    data: { wishlist: user.wishlist },
  });
};

const removeFromWishlist = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { wishlist: req.params.productId },
  });

  const user = await User.findById(req.user.id).select("wishlist").populate("wishlist", wishlistPopulate);

  return sendSuccess(res, 200, {
    message: "Product removed from wishlist.",
    data: { wishlist: user.wishlist },
  });
};

module.exports = wrapControllers({
  getProfile,
  updateProfile,
  addAddress,
  removeAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
});
