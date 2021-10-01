const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const HostelSchema = new Schema({
  name: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});
HostelSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.remove({
      _id: { $in: doc.reviews },
    });
  }
});

module.exports = mongoose.model("Hostel", HostelSchema);
