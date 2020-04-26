const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formSchema = new Schema(
  {
    parentId: String,
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },

    questions: [ {
      question: String,
      formType: String,
      answers: [
        {
          answer: String,
        }
      ]
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AddedForm', formSchema);
