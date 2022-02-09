const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const outputFolder = "public/assets";

module.exports = async (req, res, next) => {
  const images = [];
  if (!req.files) {
    return next()
  }
  const resizePromises = req.files.map(async (file) => {
    await sharp(file.path)
      .resize(2000)
      .jpeg({ quality: 50 })
      .toFile(path.resolve(outputFolder, file.filename + "_full.jpg"));

    await sharp(file.path)
      .resize(200)
      .jpeg({ quality: 30 })
      .toFile(path.resolve(outputFolder, file.filename + "_thumb.jpg"));

    fs.unlinkSync(file.path);

    images.push(file.filename);

    console.log("🚀 ~ file: imageResize.js ~ line 25 ~ resizePromises ~ resizePromises")
  });

  await Promise.all([...resizePromises]);

  req.images = images;

  next();
};
