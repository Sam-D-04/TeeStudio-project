const pricingService = require("./admin.pricing.service");

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

const getConfig = async (req, res, next) => {
  try {
    const config = await pricingService.getPricingConfiguration();

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateQuote,
  getConfig,
};
