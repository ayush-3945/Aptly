const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 45, // minutes: 30, 45, 60, 90
    },
    format: {
      type: String,
      enum: ['Video Call', 'Phone', 'In-Person'],
      default: 'Video Call',
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for efficient dashboard queries
interviewSchema.index({ recruiterId: 1, scheduledAt: 1 });
interviewSchema.index({ candidateId: 1, scheduledAt: 1 });
interviewSchema.index({ jobId: 1, candidateId: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
