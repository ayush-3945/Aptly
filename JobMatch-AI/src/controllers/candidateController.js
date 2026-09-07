const fs = require('fs');
const User = require('../models/User');
const { parseResumeWithGemini } = require('../services/resumeParserService');

/**
 * POST /api/candidate/parse-resume
 * Accepts PDF resume upload via multer, parses with Gemini API,
 * persists parsed data to candidate MongoDB profile, and returns parsed JSON.
 */
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume PDF file uploaded. Please provide a valid PDF.',
      });
    }

    const filePath = req.file.path;

    // Parse resume with Gemini
    const { parsedData, warning } = await parseResumeWithGemini(filePath);

    // If candidate is authenticated, save parsed data to candidate's MongoDB profile
    let updatedUser = null;
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (parsedData.fullName && parsedData.fullName !== 'Candidate Name') {
          user.name = parsedData.fullName;
        }
        if (parsedData.phone) user.phone = parsedData.phone;
        if (parsedData.location) user.location = parsedData.location;
        if (parsedData.currentRole) {
          user.currentRole = parsedData.currentRole;
          if (!user.targetRole) user.targetRole = parsedData.currentRole;
        }
        if (parsedData.totalExperience) user.totalExperience = parsedData.totalExperience;
        if (Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
          // Merge unique skills
          const currentSkills = Array.isArray(user.skills) ? user.skills : [];
          user.skills = Array.from(new Set([...currentSkills, ...parsedData.skills]));
        }
        if (Array.isArray(parsedData.education) && parsedData.education.length > 0) {
          user.education = parsedData.education;
        }
        if (Array.isArray(parsedData.workHistory) && parsedData.workHistory.length > 0) {
          user.workHistory = parsedData.workHistory;
        }
        if (parsedData.linkedinUrl) user.linkedinUrl = parsedData.linkedinUrl;
        if (parsedData.githubUrl) user.githubUrl = parsedData.githubUrl;
        user.resumeUrl = req.file.path.replace(/\\/g, '/');

        updatedUser = await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      data: parsedData,
      profile: updatedUser
        ? {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            currentRole: updatedUser.currentRole,
            totalExperience: updatedUser.totalExperience,
            skills: updatedUser.skills,
            education: updatedUser.education,
            workHistory: updatedUser.workHistory,
            linkedinUrl: updatedUser.linkedinUrl,
            githubUrl: updatedUser.githubUrl,
          }
        : null,
      savedToProfile: Boolean(updatedUser),
      warning: warning || null,
      message: 'Resume parsed successfully',
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse resume PDF',
    });
  }
};

/**
 * GET /api/candidate/profile
 * Retrieves logged-in candidate profile
 */
const getCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    return res.status(200).json({ success: true, profile: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/candidate/profile
 * Updates candidate profile manually from form fields
 */
const updateCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const {
      name,
      fullName,
      phone,
      location,
      currentRole,
      targetRole,
      totalExperience,
      skills,
      education,
      workHistory,
      linkedinUrl,
      githubUrl,
      bio,
    } = req.body;

    if (name !== undefined) user.name = name;
    else if (fullName !== undefined) user.name = fullName;

    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (currentRole !== undefined) user.currentRole = currentRole;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (totalExperience !== undefined) user.totalExperience = totalExperience;
    if (skills !== undefined) user.skills = skills;
    if (education !== undefined) user.education = education;
    if (workHistory !== undefined) user.workHistory = workHistory;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      profile: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        currentRole: updatedUser.currentRole,
        targetRole: updatedUser.targetRole,
        totalExperience: updatedUser.totalExperience,
        skills: updatedUser.skills,
        education: updatedUser.education,
        workHistory: updatedUser.workHistory,
        linkedinUrl: updatedUser.linkedinUrl,
        githubUrl: updatedUser.githubUrl,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  parseResume,
  getCandidateProfile,
  updateCandidateProfile,
};
