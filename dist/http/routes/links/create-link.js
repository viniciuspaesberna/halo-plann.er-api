"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLink = createLink;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
async function createLink(app) {
    app.withTypeProvider().post('/trips/:tripId/links', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                title: zod_1.z.string().min(4),
                url: zod_1.z.string().url(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params;
        const { title, url } = request.body;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found');
        }
        const link = await prisma_1.prisma.link.create({
            data: {
                title,
                url,
                trip_id: tripId,
            },
        });
        return { linkId: link.id };
    });
}
