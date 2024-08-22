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

    // Validate based on the specified option
    let input = isParam ? req.params : isQuery ? req.query : req.body;

    if (Object.keys(input).length === 0) {
      return res.status(400).json({ error: "Input object is empty!" });
    }

    // Sanitize the input without mutating the original object
    const sanitizedInput = { ...input };
    inputSanitizer(sanitizedInput);

    // Validate the sanitized input
    const validationResult = schema.validate(sanitizedInput, {
      abortEarly: false,
    });

    if (validationResult.error) {
      return res.status(400).json({
        status: "fail",
        errors: validationResult.error.details,
      });
    }

    // Set the validated value back only for the relevant part of the requests
    if (isParam) {
      req.params = validationResult.value;
    } else if (isQuery) {
      req.query = validationResult.value;
    } else {
      req.body = validationResult.value;
    }

    next();
  };
};
