import { ZodError } from 'zod';

export const zodValidate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query)  req.query  = schemas.query.parse(req.query);
    if (schemas.body)   req.body   = schemas.body.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: 'invalid request',
        details: err.errors.map(e => e.message)
      });
    }
    next(err);
  }
};
