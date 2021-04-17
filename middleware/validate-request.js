module.exports = validateRequest;

function validateRequest(req, next, schema) {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnkown: true,
  };
  const {error, value} = schema.validate(req.body, options);
  if (error) {
    console.log(error);
    // next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
  } else {
    console.log("Validated");
    req.body = value;
		next();
  }
}
