import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        //Throw the error to be caught by the global handler
        throw new Error(errors.array()[0].msg);
    }

    next();
};