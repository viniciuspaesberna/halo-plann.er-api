"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmParticipant = void 0;
const zod_1 = require("zod");
const env_1 = require("../../../env");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
const confirmParticipant = async (app) => {
    app.withTypeProvider().put('/participants/:participantId/confirm', {
        schema: {
            params: zod_1.z.object({
                participantId: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                name: zod_1.z.string().min(3).optional(),
                email: zod_1.z.string().email(),
            }),
        },
    }, async (request, reply) => {
        const { participantId } = request.params;
        const { name, email } = request.body;
        const participant = await prisma_1.prisma.participant.findUnique({
            where: {
                id: participantId,
            },
        });
        if (!participant) {
            throw new bad_request_error_1.BadRequestError('Participant not found.');
        }
        if (participant.is_confirmed) {
            return reply.redirect(`${env_1.env.WEB_BASE_URL}/trips/${participant.trip_id}`);
        }
        await prisma_1.prisma.participant.update({
            where: {
                id: participant.id,
                email,
            },
            data: {
                name,
                is_confirmed: true,
            },
        });
        return { participantId: participant.id };
    });
};
exports.confirmParticipant = confirmParticipant;
