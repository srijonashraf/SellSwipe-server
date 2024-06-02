import validator from "validator";

export const validateRequest = ({
  schema,
  isParam = false,
  isQuery = false,
}) => {
  return (req, res, next) => {
    if (!schema) {
      return res
        .status(500)
        .json({ error: "Validation schema is not defined" });
    }

    const input = isParam ? req.params : isQuery ? req.query : req.body;

    // Sanitize
    for (let key in input) {
      if (typeof input[key] === "string") {
        input[key] = validator.escape(input[key]);
      }
    }

    const validationResult = schema.validate(input, { abortEarly: false }); // Joi Validator

    if (validationResult.error) {
      return res
        .status(400)
        .json({ status: "fail", errors: validationResult.error.details });
    }

    if (isParam) {
      req.params = validationResult.value;
    }
    if (isQuery) {
      req.query = validationResult.value;
    } else {
      req.body = validationResult.value;
    }

    next();
  };
};
