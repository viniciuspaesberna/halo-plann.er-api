"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    API_BASE_URL: zod_1.z.string().url(),
    WEB_BASE_URL: zod_1.z.string().url(),
    GOOGLE_APP_USER: zod_1.z.string(),
    GOOGLE_APP_PASSWORD: zod_1.z.string(),
    PORT: zod_1.z.coerce.number().default(3333),
});
exports.env = envSchema.parse(process.env);
