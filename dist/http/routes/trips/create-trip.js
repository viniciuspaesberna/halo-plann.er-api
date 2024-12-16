"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrip = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const zod_1 = require("zod");
const env_1 = require("../../../env");
const dayjs_1 = require("../../../lib/dayjs");
const mail_1 = require("../../../lib/mail");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
const createTrip = async (app) => {
    app.withTypeProvider().post('/trips', {
        schema: {
            body: zod_1.z.object({
                destination: zod_1.z.string().min(4),
                starts_at: zod_1.z.coerce.date(),
                ends_at: zod_1.z.coerce.date(),
                owner_name: zod_1.z.string(),
                owner_email: zod_1.z.string().email(),
                emails_to_invite: zod_1.z.array(zod_1.z.string().email()),
            }),
            response: {
                204: zod_1.z.object({
                    tripId: zod_1.z.string().uuid(),
                }),
            },
        },
    }, async (request) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite, } = request.body;
        // ============ Validate dates =============
        if ((0, dayjs_1.dayjs)(starts_at).isBefore(new Date())) {
            throw new bad_request_error_1.BadRequestError('Invalid trip start date');
        }
        if ((0, dayjs_1.dayjs)(ends_at).isBefore(starts_at)) {
            throw new bad_request_error_1.BadRequestError('Invalid trip end date');
        }
        let validatedEmailsToInvite = emails_to_invite;
        if (emails_to_invite.includes(owner_email)) {
            if (emails_to_invite.includes(owner_email)) {
                validatedEmailsToInvite = emails_to_invite.filter((email) => email !== owner_email);
            }
        }
        const trip = await prisma_1.prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                email: owner_email,
                                name: owner_name,
                                is_owner: true,
                            },
                            ...validatedEmailsToInvite.map((email) => {
                                return { email };
                            }),
                        ],
                    },
                },
            },
        });
        const formatedStartDate = (0, dayjs_1.dayjs)(starts_at).format('LL');
        const formatedEndDate = (0, dayjs_1.dayjs)(ends_at).format('LL');
        const confimationLink = `${env_1.env.API_BASE_URL}/trips/${trip.id}/confirm`;
        const mail = await (0, mail_1.getMailClient)();
        const message = await mail.sendMail({
            from: {
                name: 'Equipe Plann.er',
                address: 'oi@plann.er',
            },
            to: {
                name: owner_name,
                address: owner_email,
            },
            subject: `Confirme sua viagem para ${destination} em ${formatedStartDate}`,
            html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você solicitou a crianção de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formatedStartDate}</strong> até <strong>${formatedEndDate}</strong>.</p>
            <p></p>
            <p>Para confimar sua viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confimationLink}">
                Confimar viagem
              </a>
            </p>
            <p></p>
            <p>Caso você não saiba do que se trata esse email, apenas ignore esse e-mail.</p>
          </div>
        `.trim(),
        });
        console.log('confirm trip:' + nodemailer_1.default.getTestMessageUrl(message));
        return { tripId: trip.id };
    });
};
exports.createTrip = createTrip;
