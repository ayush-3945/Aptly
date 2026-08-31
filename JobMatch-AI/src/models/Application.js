const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'interview', 'rejected', 'hired'],
    default: 'applied',
  }
}, { timestamps: { createdAt: 'appliedAt', updatedAt: true } }); 

module.exports = mongoose.model('Application', applicationSchema);
