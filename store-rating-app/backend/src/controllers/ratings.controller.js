const ratingsService = require('../services/ratings.service');

const submit = async (req, res, next) => {
  try {
    const rating = await ratingsService.submitOrUpdate(
      req.user.id,
      req.body.storeId,
      req.body.value
    );
    res.status(200).json(rating);
  } catch (err) { next(err); }
};

module.exports = { submit };
