const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    required: true,
  }
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model('Job', jobSchema);
