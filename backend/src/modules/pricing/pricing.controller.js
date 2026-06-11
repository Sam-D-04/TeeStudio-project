const pricingService = require("./pricing.service");

const calculateQuote = (req, res, next) => {
  try {
    const quote = pricingService.calculateDesignQuote(req.body);

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateQuote,
};
