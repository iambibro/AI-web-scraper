"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const message = error.details.map((detail) => detail.message).join(', ');
            next(new errorHandler_1.AppError(400, message));
        }
        next();
    };
};
exports.validate = validate;
