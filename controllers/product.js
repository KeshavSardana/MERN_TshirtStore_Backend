// 13th

const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product Not Found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm({ keepExtensions: true });
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with file",
        exactError: err,
      });
    }

    // destructuring the feilds
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please enter all fields , its mandatory to create a product",
      });
    }

    let product = new Product(fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big , max allowed size is 3 Mb",
        });
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // save to the DB
    product.save((err, createdProduct) => {
      if (err) {
        return res.status(400).json({
          error: "Saving product in DB Failed",
        });
      }
      res.json(createdProduct);
    });
  });
};

exports.getProduct = (req, res) => {
  // its easy just send the product which we populated in req via the productId param its easy we did this earlier aswell BUT
  // incase you are forgetting that product object is containing a big binary file photo which is gonna be bulky to send SO
  // remove that photo from the object and then send the object so that the product object gets there quickly
  // and then send the photo of that product in the backend via the middleware slowly .
  // we will make requests to two routes for getting a single product ie one for key values and one for bulky photo via the frontend.

  req.product.photo = undefined;
  return res.json(req.product);
};

// middleware to send the photo of the product
// this is gonna make our application very optimise
exports.getProductPhoto = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with the file uploaded",
      });
    }

    // updation code
    // This is the updation of product via the extend method which lodash provides us. It updated the product with the
    //  fields if something is new or changed
    let product = req.product;
    product = _.extend(product, fields);

    // lets handle the fil now
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big , max allowed size is 3 Mb",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    // lets save the product in DB
    product.save((err, updatedProduct) => {
      if (err) {
        return res.status(400).json({
          error: "Updation of the product Failed",
        });
      }
      res.json(updatedProduct);
    });
  });
};

exports.removeProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }
    res.json({
      message: "Successfully Deleted the product",
      deletedProduct,
    });
  });
};

// good method to learn to configuring the result object

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "descending"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No Product Found",
        });
      }
      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No Category Found",
      });
    }
    res.json(category.name);
  });
};

// middleware that we will use later on to perform some bulk operations together ( stock and sold updations here after buying )
exports.updateStock = (req, res, next) => {
  let myoperations = req.body.order.products.map((product) => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -product.count, sold: +product.count } },
      },
    };
  });

  Product.bulkWrite(myoperations, {}, (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Operations Failed",
      });
    }
    next();
  });
};
