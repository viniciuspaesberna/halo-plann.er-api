"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailClient = getMailClient;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../env");
// export async function getMailClient() {
//   const account = await nodemailer.createTestAccount()
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: {
//       user: account.user,
//       pass: account.pass,
//     },
//   })
//   return transporter
// }
const googleAppUser = env_1.env.GOOGLE_APP_USER;
const googleAppPassword = env_1.env.GOOGLE_APP_PASSWORD;
async function getMailClient() {
    const transporter = nodemailer_1.default.createTransport({
        service: 'plann.er',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: googleAppUser,
            pass: googleAppPassword,
        },
    });
    return transporter;
}
