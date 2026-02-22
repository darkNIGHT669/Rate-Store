const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Account created successfully', user });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) { next(err); }
};

const me = (req, res) => {
  res.json(req.user);
};

const updatePassword = async (req, res, next) => {
  try {
    const result = await authService.updatePassword(req.user.id, req.body.newPassword);
    res.json(result);
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
};

module.exports = { register, login, me, updatePassword, createUser };
