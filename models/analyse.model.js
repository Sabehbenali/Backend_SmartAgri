const mongoose = require("mongoose");

const analyseSchema = new mongoose.Schema({
   image:String,
   diagnostic:String,
   solution:String,
   createdAt:{
      type:Date,
      default:Date.now
   }
});

module.exports = mongoose.model("Analyse", analyseSchema);