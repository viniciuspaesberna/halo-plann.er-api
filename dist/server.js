"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const env_1 = require("./env");
const error_handler_1 = require("./error-handler");
const router_1 = require("./router");
dotenv_1.default.config();
const app = (0, fastify_1.default)();
app.register(cors_1.default, {
    origin: '*',
});
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.setErrorHandler(error_handler_1.errorHandler);
app.register(router_1.router);
app.listen({ port: env_1.env.PORT || 3333, host: '0.0.0.0' }).then(() => {
    console.log(`Server running ${env_1.env.API_BASE_URL}`);
});
