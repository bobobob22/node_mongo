const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formSchema = new Schema(
  {
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

    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', formSchema);
