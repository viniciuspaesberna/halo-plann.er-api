"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripDetails = getTripDetails;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
async function getTripDetails(app) {
    app.withTypeProvider().get('/trips/:tripId', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            select: {
                id: true,
                destination: true,
                starts_at: true,
                ends_at: true,
                is_confirmed: true,
            },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found');
        }
        return { trip };
    });
}
