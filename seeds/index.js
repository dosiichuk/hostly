const mongoose = require("mongoose");
const Hostel = require("../models/hostel");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Hostel.deleteMany({});
  for (let i = 0; i < 50; i++) {
    let rand = Math.floor(Math.random() * 1000);
    let newH = new Hostel({
      location: `${cities[rand].city}, ${cities[rand].state}`,
      name: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/190727/1600x900",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus optio similique error. Voluptatum, nihil odit.",
      price: Math.floor(Math.random() * 20) + 10,
    });
    await newH.save();
  }
};
seedDB().then(() => db.close());
