const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  targetRole: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  currentRole: {
    type: String,
    default: '',
  },
  totalExperience: {
    type: String,
    default: '',
  },
  education: [
    {
      degree: { type: String, default: '' },
      institution: { type: String, default: '' },
      year: { type: String, default: '' },
    },
  ],
  workHistory: [
    {
      company: { type: String, default: '' },
      role: { type: String, default: '' },
      duration: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  ],
  linkedinUrl: {
    type: String,
    default: '',
  },
  githubUrl: {
    type: String,
    default: '',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
