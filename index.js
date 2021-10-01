const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Hostel = require("./models/hostel");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");

const { hostelSchema, reviewSchema } = require("./schemas");

mongoose.connect("mongodb://localhost:27017/hostly", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console.error, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
const validateHostel = (req, res, next) => {
  const { error } = hostelSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get(
  "/hostels",
  catchAsync(async (req, res) => {
    const hostels = await Hostel.find({});
    res.render("hostels/index.ejs", { hostels });
  })
);

app.get("/hostels/new", (req, res) => {
  res.render("hostels/new.ejs");
});

app.post(
  "/hostels",
  validateHostel,
  catchAsync(async (req, res) => {
    // if (!req.body.hostel) throw new ExpressError("Invalid hostel data", 400);

    const hostel = new Hostel(req.body.hostel);
    await hostel.save();
    res.redirect(`/hostels/${hostel._id}`);
  })
);

app.get(
  "/hostels/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const hostel = await Hostel.findById(id).populate("reviews");
    res.render("hostels/show.ejs", { hostel });
  })
);

app.get(
  "/hostels/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundHostel = await Hostel.findById(id);
    res.render("hostels/edit.ejs", { foundHostel });
  })
);
app.put(
  "/hostels/:id",
  validateHostel,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundHostel = await Hostel.findByIdAndUpdate(id, {
      ...req.body.hostel,
    });
    res.redirect(`/hostels/${foundHostel._id}`);
  })
);
app.delete(
  "/hostels/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundHostel = await Hostel.findByIdAndDelete(id);
    res.redirect("/hostels");
  })
);
app.post(
  "/hostels/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const hostel = await Hostel.findById(req.params.id);
    const review = new Review(req.body.review);
    hostel.reviews.push(review);
    await hostel.save();
    await review.save();
    res.redirect(`/hostels/${hostel._id}`);
  })
);

app.delete(
  "/hostels/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hostel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/hostels/${id}`);
  })
);
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(3000, () => {
  console.log("listeting at port 3000");
});
