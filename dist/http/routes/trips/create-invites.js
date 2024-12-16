"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvites = createInvites;
const nodemailer_1 = __importDefault(require("nodemailer"));
const zod_1 = require("zod");
const env_1 = require("../../../env");
const dayjs_1 = require("../../../lib/dayjs");
const mail_1 = require("../../../lib/mail");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
async function createInvites(app) {
    app.withTypeProvider().post('/trips/:tripId/invites', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                emails_to_invite: zod_1.z.array(zod_1.z.string().email()).min(1),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params;
        const { emails_to_invite } = request.body;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: { participants: true },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found');
        }
        let validatedEmailsToInvite = emails_to_invite;
        for (const email of emails_to_invite) {
            if (trip.participants.find((participant) => participant.email === email)) {
                validatedEmailsToInvite = emails_to_invite.filter((currentEmail) => currentEmail !== email);
            }
        }
        await prisma_1.prisma.participant.createMany({
            data: [
                ...validatedEmailsToInvite.map((email) => {
                    return { email, trip_id: trip.id };
                }),
            ],
        });
        if (!trip.is_confirmed) {
            return { tripId: trip.id };
        }
        const newParticipants = trip.participants.map((participant) => {
            if (participant.is_owner)
                return null;
            if (emails_to_invite.includes(participant.email))
                return null;
            return participant;
        });
        console.log(newParticipants);
        const formatedStartDate = (0, dayjs_1.dayjs)(trip.starts_at).format('LL');
        const formatedEndDate = (0, dayjs_1.dayjs)(trip.ends_at).format('LL');
        const mail = await (0, mail_1.getMailClient)();
        await Promise.all(newParticipants.map(async (participant) => {
            if (!participant)
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
        return { tripId: trip.id };
    });
}
