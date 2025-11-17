const validateRequest = (schema = {}) => (req, res, next) => {
  try {
    for (const key of Object.keys(schema)) {
      const validator = schema[key];
      if (!validator) {
        continue;
      }

      const result = validator.safeParse(req[key]);
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          details: result.error.flatten()
        });
        return;
      }
      req[key] = result.data;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validateRequest;
