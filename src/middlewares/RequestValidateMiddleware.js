import validator from "validator";

export const inputSanitizer = (input) => {
  // Sanitize
  for (let key in input) {
    if (typeof input[key] === "string") {
      input[key] = validator.escape(input[key]);
    }
  }
};

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

    if (Object.keys(input).length === 0) {
      throw new Error("Input object is empty!");
    }

    inputSanitizer(input);

    // console.log(input); //To debug sanitize inputs

    const validationResult = schema.validate(input, { abortEarly: false }); // Joi Validator (This will validate the request schema)

    if (validationResult.error) {
      return res.status(400).json({
        status: "fail",
        errors: validationResult.error.details,
      });
    }

    // console.log(validationResult); //To debug validationResult

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
