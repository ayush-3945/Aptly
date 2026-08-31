const recruiterOnly = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, recruiter only' });
  }
};

const candidateOnly = (req, res, next) => {
  if (req.user && req.user.role === 'candidate') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, candidate only' });
  }
};

module.exports = { recruiterOnly, candidateOnly };
