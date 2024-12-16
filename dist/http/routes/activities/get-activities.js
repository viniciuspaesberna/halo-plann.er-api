"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = getActivities;
const zod_1 = require("zod");
const dayjs_1 = require("../../../lib/dayjs");
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../../_errors/bad-request-error");
async function getActivities(app) {
    app.withTypeProvider().get('/trips/:tripId/activities', {
        schema: {
            params: zod_1.z.object({
                tripId: zod_1.z.string().uuid(),
            }),
        },
    }, async (request) => {
        const { tripId } = request.params;
        const trip = await prisma_1.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                activities: {
                    orderBy: {
                        occurs_at: 'asc',
                    },
                },
            },
        });
        if (!trip) {
            throw new bad_request_error_1.BadRequestError('Trip not found');
        }
        const differenceInDaysBetweenTripStartAndEnd = (0, dayjs_1.dayjs)(trip.ends_at).diff(trip.starts_at, 'days');
        const activities = Array.from({
            length: differenceInDaysBetweenTripStartAndEnd + 1,
        }).map((_, index) => {
            const date = (0, dayjs_1.dayjs)(trip.starts_at).add(index, 'days');
            return {
                date: date.toDate(),
                activities: trip.activities.filter((activity) => {
                    return (0, dayjs_1.dayjs)(activity.occurs_at).isSame(date, 'day');
                }),
            };
        });
        return { activities };
    });
}
