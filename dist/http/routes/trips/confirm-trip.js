"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmTrip = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const zod_1 = require("zod");
const env_1 = require("../../../env");
const dayjs_1 = require("../../../lib/dayjs");
const mail_1 = require("../../../lib/mail");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
const confirmTrip = async (app) => {
    app.withTypeProvider().get('/trips/:tripId/confirm', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
        },
    }, async (request, reply) => {
        const { tripId } = request.params;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: true,
            },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found.');
        }
        if (trip.is_confirmed) {
            return reply.redirect(`${env_1.env.WEB_BASE_URL}/trips/${tripId}`);
        }
        const owner = trip.participants.find((participant) => participant.is_owner === true);
        if (!owner) {
            throw new bad_request_error_1.BadRequestError('Owner not found');
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.trip.update({
                where: {
                    id: tripId,
                },
                data: {
                    is_confirmed: true,
                },
            }),
            prisma_1.prisma.participant.update({
                where: {
                    id: owner.id,
                    trip_id: tripId,
                    is_owner: true,
                },
                data: {
                    is_confirmed: true,
                },
            }),
        ]);
        const formatedStartDate = (0, dayjs_1.dayjs)(trip.starts_at).format('LL');
        const formatedEndDate = (0, dayjs_1.dayjs)(trip.ends_at).format('LL');
        const mail = await (0, mail_1.getMailClient)();
        await Promise.all(trip.participants.map(async (participant) => {
            if (participant.is_owner === true)
                return;
            const confimationLink = `${env_1.env.WEB_BASE_URL}/trips/${trip.id}/participants/${participant.id}/confirm?email=${participant.email}`;
            const message = await mail.sendMail({
                from: {
                    name: 'Equipe Plann.er',
                    address: 'oi@plann.er',
                },
                to: participant.email,
                subject: `Confirme sua presença na viagem para ${trip.destination} em ${formatedStartDate}`,
                html: `
              <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formatedStartDate}</strong> até <strong>${formatedEndDate}</strong>.</p>
                <p></p>
                <p>Para confimar sua presença, clique no link abaixo:</p>
                <p></p>
                <p>
                  <a href="${confimationLink}">
                    Confimar presença
                  </a>
                </p>
                <p></p>
                <p>Caso você não saiba do que se trata esse email, apenas ignore esse e-mail.</p>
              </div>
            `.trim(),
            });
            console.log('confirm participation:' + nodemailer_1.default.getTestMessageUrl(message));
            return message;
        }));
        return reply.redirect(`${env_1.env.WEB_BASE_URL}/trips/${tripId}`);
    });
};
exports.confirmTrip = confirmTrip;
