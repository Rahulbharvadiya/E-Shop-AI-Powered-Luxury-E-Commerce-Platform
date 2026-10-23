import { AppError } from './errorHandler.js';

export const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const details = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        return next(new AppError(`Validation error: ${details}`, 400));
      }
      next(new AppError(err.message, 400));
    }
  };
};
