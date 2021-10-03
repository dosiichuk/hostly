express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Hostel = require("../models/hostel");
const ExpressError = require("../utils/ExpressError");
const { hostelSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");

const validateHostel = (req, res, next) => {
  const { error } = hostelSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
router.get(
  "/",
  catchAsync(async (req, res) => {
    const hostels = await Hostel.find({});
    res.render("hostels/index.ejs", { hostels });
  })
);

router.get("/new", (req, res) => {
  res.render("hostels/new.ejs");
});

router.post(
  "/",
  validateHostel,
  catchAsync(async (req, res) => {
    // if (!req.body.hostel) throw new ExpressError("Invalid hostel data", 400);

    const hostel = new Hostel(req.body.hostel);
    await hostel.save();
    req.flash("success", "Sucessfully added a new hostel ");
    res.redirect(`/hostels/${hostel._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const hostel = await Hostel.findById(id).populate("reviews");
    if (!hostel) {
      req.flash("error", "Cannot find the selected hostel");
      res.redirect("/hostels");
    }
    res.render("hostels/show.ejs", { hostel });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundHostel = await Hostel.findById(id);
    res.render("hostels/edit.ejs", { foundHostel });
  })
);
router.put(
  "/:id",
  validateHostel,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundHostel = await Hostel.findByIdAndUpdate(id, {
      ...req.body.hostel,
    });
    req.flash("success", "Sucessfully updated hostel data");
    res.redirect(`/hostels/${foundHostel._id}`);
  })
);
router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundHostel = await Hostel.findByIdAndDelete(id);
    req.flash("success", "Sucessfully deleted a hostel ");
    res.redirect("/hostels");
  })
);

module.exports = router;
