const getValueByPath = (source, path) => {
  return path.split(".").reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return current[key];
  }, source);
};

const isEmpty = (value) => {
  return value === undefined || value === null || value === "";
};

const isNumberLike = (value) => {
  return value !== "" && !Number.isNaN(Number(value));
};

const matchesType = (value, type) => {
  if (type === "array") {
    return Array.isArray(value);
  }

  if (type === "integer") {
    return isNumberLike(value) && Number.isInteger(Number(value));
  }

  if (type === "number") {
    return isNumberLike(value);
  }

  if (type === "boolean") {
    return (
      typeof value === "boolean" || value === "true" || value === "false"
    );
  }

  if (type === "object") {
    return (
      typeof value === "object" && value !== null && !Array.isArray(value)
    );
  }

  return typeof value === type;
};

const validateField = (value, rules, location, field, req) => {
  const errors = [];
  const label = rules.label || field;

  if (rules.required && isEmpty(value)) {
    errors.push({
      field,
      location,
      message: `${label} is required`,
    });
    return errors;
  }

  if (isEmpty(value)) {
    return errors;
  }

  if (rules.type && !matchesType(value, rules.type)) {
    errors.push({
      field,
      location,
      message: `${label} must be ${rules.type}`,
    });
    return errors;
  }

  if (rules.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== "string" || !emailPattern.test(value)) {
      errors.push({
        field,
        location,
        message: `${label} must be a valid email`,
      });
    }
  }

  if (rules.minLength && String(value).length < rules.minLength) {
    errors.push({
      field,
      location,
      message: `${label} must be at least ${rules.minLength} characters`,
    });
  }

  if (rules.maxLength && String(value).length > rules.maxLength) {
    errors.push({
      field,
      location,
      message: `${label} must be at most ${rules.maxLength} characters`,
    });
  }

  if (rules.min !== undefined && Number(value) < rules.min) {
    errors.push({
      field,
      location,
      message: `${label} must be greater than or equal to ${rules.min}`,
    });
  }

  if (rules.max !== undefined && Number(value) > rules.max) {
    errors.push({
      field,
      location,
      message: `${label} must be less than or equal to ${rules.max}`,
    });
  }

  if (rules.enum && !rules.enum.includes(value)) {
    errors.push({
      field,
      location,
      message: `${label} must be one of: ${rules.enum.join(", ")}`,
    });
  }

  if (rules.pattern && !rules.pattern.test(String(value))) {
    errors.push({
      field,
      location,
      message: `${label} has invalid format`,
    });
  }

  if (rules.custom) {
    const result = rules.custom(value, req);
    if (result !== true) {
      errors.push({
        field,
        location,
        message: typeof result === "string" ? result : `${label} is invalid`,
      });
    }
  }

  return errors;
};

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const sources = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    Object.entries(schema).forEach(([location, fields]) => {
      Object.entries(fields).forEach(([field, rules]) => {
        const value = getValueByPath(sources[location] || {}, field);
        errors.push(...validateField(value, rules, location, field, req));
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

module.exports = validate;
