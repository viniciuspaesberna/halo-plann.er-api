"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipant = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
const getParticipant = async (app) => {
    app.withTypeProvider().get('/participants/:participantId', {
        schema: {
            params: zod_1.z.object({
                participantId: zod_1.z.string().uuid(),
            }),
        },
    }, async (request) => {
        const { participantId } = request.params;
        const participant = await prisma_1.prisma.participant.findUnique({
            where: {
                id: participantId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                is_confirmed: true,
            },
        });
        if (!participant) {
            throw new bad_request_error_1.BadRequestError('Participant not found.');
        }
        return { participant };
    });
};
exports.getParticipant = getParticipant;
