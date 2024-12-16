"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const bad_request_error_1 = require("./http/_errors/bad-request-error");
const errorHandler = (error, request, reply) => {
    console.log(error);
    if (error instanceof zod_1.ZodError) {
        return reply.status(400).send({
            message: 'Input validation error',
            errors: error.flatten().fieldErrors,
        });
    }
    if (error instanceof bad_request_error_1.BadRequestError) {
        return reply.status(400).send({
            message: error.message,
        });
    }
    return reply.status(500).send({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
