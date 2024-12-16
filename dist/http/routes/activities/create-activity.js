"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivity = createActivity;
const zod_1 = require("zod");
const dayjs_1 = require("../../../lib/dayjs");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
async function createActivity(app) {
    app.withTypeProvider().post('/trips/:tripId/activities', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                title: zod_1.z.string().min(4),
                occurs_at: zod_1.z.coerce.date(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params;
        const { title, occurs_at } = request.body;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found');
        }
        if ((0, dayjs_1.dayjs)(occurs_at).isBefore(trip.starts_at)) {
            throw new bad_request_error_1.BadRequestError('Invalid activity date.');
        }
        if ((0, dayjs_1.dayjs)(occurs_at).isAfter(trip.ends_at)) {
            throw new bad_request_error_1.BadRequestError('Invalid activity date.');
        }
        const activity = await prisma_1.prisma.activity.create({
            data: {
                title,
                occurs_at,
                trip_id: tripId,
            },
        });
        return { activityId: activity.id };
    });
}
