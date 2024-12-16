"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipants = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
const getParticipants = async (app) => {
    app.withTypeProvider().get('/trips/:tripId/participants', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_confirmed: true,
                        is_owner: true,
                    },
                },
            },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found.');
        }
        return { participants: trip.participants };
    });
};
exports.getParticipants = getParticipants;
