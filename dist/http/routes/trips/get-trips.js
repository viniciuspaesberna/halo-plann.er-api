"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrips = void 0;
const prisma_1 = require("../../../lib/prisma");
const getTrips = async (app) => {
    app.get('/trips', async () => {
        const trips = await prisma_1.prisma.trip.findMany({
            include: {
                participants: true,
                activities: true,
                links: true,
            },
        });
        return trips;
    });
};
exports.getTrips = getTrips;
