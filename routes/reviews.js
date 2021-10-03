express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");
const Hostel = require("../models/hostel");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schemas");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const hostel = await Hostel.findById(req.params.id);
    const review = new Review(req.body.review);
    hostel.reviews.push(review);
    await hostel.save();
    await review.save();
    req.flash("success", "Sucessfully added a hostel review ");
    res.redirect(`/hostels/${hostel._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hostel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Sucessfully deleted a review ");
    res.redirect(`/hostels/${id}`);
  })
);
module.exports = router;
