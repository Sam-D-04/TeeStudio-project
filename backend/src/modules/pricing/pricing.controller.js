const pricingService = require("./pricing.service");

const calculateQuote = async (req, res, next) => {
  try {
    const quote = await pricingService.calculateDesignQuote(req.body);

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
