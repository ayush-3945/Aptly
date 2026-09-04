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
    enum: ['applied', 'shortlisted', 'interview', 'rejected', 'hired'],
    default: 'applied',
  },
  aiMatchScore: {
    type: Number,
    default: null,
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  fitSummary: {
    type: String,
    default: '',
  },
  experienceFit: {
    type: String,
    default: '',
  },
  recommendation: {
    type: String,
    enum: ['Strong Match', 'Moderate Match', 'Low Match', 'Pending Evaluation'],
    default: 'Pending Evaluation',
  },
}, { timestamps: { createdAt: 'appliedAt', updatedAt: true } }); 

module.exports = mongoose.model('Application', applicationSchema);
