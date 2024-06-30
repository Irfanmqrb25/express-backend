import mongoose from "mongoose";
import products from "./data.js";
import Product from "../model/productModel.js";

const seedProducts = async () => {
  try {
    await mongoose.connect("mongodb+srv://farhansf2002:cka2y9DYOxdUvOfZ@twennyscluster.qkj9cdv.mongodb.net/twennys?retryWrites=true&w=majority&appName=TwennysCluster");

    await Product.deleteMany();
    console.log("Products are deleted");

    await Product.insertMany(products);
    console.log("Products are added");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
