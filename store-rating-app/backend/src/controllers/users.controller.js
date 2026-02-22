const usersService = require('../services/users.service');

const getAll = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;
    const users = await usersService.findAll({ name, email, address, role, sortBy, sortOrder });
    res.json(users);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await usersService.getDashboardStats();
    res.json(stats);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const user = await usersService.findOne(req.params.id);
    res.json(user);
  } catch (err) { next(err); }
};

module.exports = { getAll, getStats, getOne };
