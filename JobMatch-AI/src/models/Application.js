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
    enum: ['applied', 'shortlisted', 'interview', 'offer', 'rejected', 'hired'],
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
  scoreBreakdown: {
    skillsScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 0 },
  },
  skillGapRoadmap: [{
    skill: { type: String, default: '' },
    priority: { type: String, default: 'Medium' },
    impact: { type: String, default: '' },
    timeToBridge: { type: String, default: '' },
    actionPlan: { type: String, default: '' },
    resource: { type: String, default: '' },
  }],
  resumeImprovements: {
    type: [String],
    default: [],
  },
}, { timestamps: { createdAt: 'appliedAt', updatedAt: true } }); 

module.exports = mongoose.model('Application', applicationSchema);
