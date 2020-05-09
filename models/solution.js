const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const solutionSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  surveyId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Solution", solutionSchema);
