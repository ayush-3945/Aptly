const User = require('../models/User');

// GET /api/users/profile - Get logged-in user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/profile - Update logged-in user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      fullName,
      bio,
      targetRole,
      currentRole,
      totalExperience,
      phone,
      skills,
      location,
      education,
      workHistory,
      linkedinUrl,
      githubUrl,
    } = req.body;

    if (name !== undefined) user.name = name;
    else if (fullName !== undefined) user.name = fullName;

    if (bio !== undefined) user.bio = bio;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (currentRole !== undefined) user.currentRole = currentRole;
    if (totalExperience !== undefined) user.totalExperience = totalExperience;
    if (phone !== undefined) user.phone = phone;
    if (skills !== undefined) user.skills = skills;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;
    if (workHistory !== undefined) user.workHistory = workHistory;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      targetRole: updatedUser.targetRole,
      currentRole: updatedUser.currentRole,
      totalExperience: updatedUser.totalExperience,
      skills: updatedUser.skills,
      location: updatedUser.location,
      education: updatedUser.education,
      workHistory: updatedUser.workHistory,
      linkedinUrl: updatedUser.linkedinUrl,
      githubUrl: updatedUser.githubUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
