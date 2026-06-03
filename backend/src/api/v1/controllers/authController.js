const User = require('../../../models/User');
const jwt = require('jsonwebtoken');
const { ROLES, PUBLIC_REGISTER_ROLES } = require('../../../config/permissions');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userResponse = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  fullName: user.fullName,
});

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const userCount = await User.countDocuments();
    let assignedRole = role || ROLES.SA;
    if (userCount === 0) {
      assignedRole = role || ROLES.ADMIN;
    } else if (!PUBLIC_REGISTER_ROLES.includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for registration. Admin accounts must be created by an administrator.',
      });
    }

    const user = await User.create({ fullName, email, password, role: assignedRole });
    const token = signToken(user);
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: userResponse(req.user) });
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role query param required' });
    }
    const users = await User.find({ role }).select('fullName email role').sort({ fullName: 1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
