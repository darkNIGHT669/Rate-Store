const storesService = require('../services/stores.service');

const create = async (req, res, next) => {
  try {
    const store = await storesService.create(req.body);
    res.status(201).json(store);
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const stores = await storesService.findAll({
      name, address, sortBy, sortOrder, userId: req.user.id
    });
    res.json(stores);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const store = await storesService.findOne(req.params.id, req.user.id);
    res.json(store);
  } catch (err) { next(err); }
};

const getOwnerDashboard = async (req, res, next) => {
  try {
    const data = await storesService.getOwnerDashboard(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getOne, getOwnerDashboard };
