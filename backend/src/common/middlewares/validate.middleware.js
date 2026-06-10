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
      message: `${label} là bắt buộc`,
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
      message: `${label} phải có kiểu ${rules.type}`,
    });
    return errors;
  }

  if (rules.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value !== "string" || !emailPattern.test(value)) {
      errors.push({
        field,
        location,
        message: `${label} phải là email hợp lệ`,
      });
    }
  }

  if (rules.minLength && String(value).length < rules.minLength) {
    errors.push({
      field,
      location,
      message: `${label} phải có ít nhất ${rules.minLength} ký tự`,
    });
  }

  if (rules.maxLength && String(value).length > rules.maxLength) {
    errors.push({
      field,
      location,
      message: `${label} chỉ được có tối đa ${rules.maxLength} ký tự`,
    });
  }

  if (rules.min !== undefined && Number(value) < rules.min) {
    errors.push({
      field,
      location,
      message: `${label} phải lớn hơn hoặc bằng ${rules.min}`,
    });
  }

  if (rules.max !== undefined && Number(value) > rules.max) {
    errors.push({
      field,
      location,
      message: `${label} phải nhỏ hơn hoặc bằng ${rules.max}`,
    });
  }

  if (rules.enum && !rules.enum.includes(value)) {
    errors.push({
      field,
      location,
      message: `${label} phải là một trong các giá trị: ${rules.enum.join(", ")}`,
    });
  }

  if (rules.pattern && !rules.pattern.test(String(value))) {
    errors.push({
      field,
      location,
      message: `${label} có định dạng không hợp lệ`,
    });
  }

  if (rules.custom) {
    const result = rules.custom(value, req);
    if (result !== true) {
      errors.push({
        field,
        location,
        message: typeof result === "string" ? result : `${label} không hợp lệ`,
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
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    next();
  };
};

module.exports = validate;
