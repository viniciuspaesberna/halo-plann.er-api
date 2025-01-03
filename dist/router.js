"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const create_activity_1 = require("./http/routes/activities/create-activity");
const get_activities_1 = require("./http/routes/activities/get-activities");
const create_link_1 = require("./http/routes/links/create-link");
const get_links_1 = require("./http/routes/links/get-links");
const confirm_participant_1 = require("./http/routes/participants/confirm-participant");
const get_participant_1 = require("./http/routes/participants/get-participant");
const get_participants_1 = require("./http/routes/participants/get-participants");
const confirm_trip_1 = require("./http/routes/trips/confirm-trip");
const create_invites_1 = require("./http/routes/trips/create-invites");
const create_trip_1 = require("./http/routes/trips/create-trip");
const get_trip_details_1 = require("./http/routes/trips/get-trip-details");
const get_trips_1 = require("./http/routes/trips/get-trips");
const update_trip_1 = require("./http/routes/trips/update-trip");
const router = async (app) => {
    app.register(get_trips_1.getTrips);
    app.register(get_trip_details_1.getTripDetails);
    app.register(create_trip_1.createTrip);
    app.register(update_trip_1.updateTrip);
    app.register(confirm_trip_1.confirmTrip);
    app.register(create_invites_1.createInvites);
    app.register(get_participant_1.getParticipant);
    app.register(get_participants_1.getParticipants);
    app.register(confirm_participant_1.confirmParticipant);
    app.register(create_activity_1.createActivity);
    app.register(get_activities_1.getActivities);
    app.register(create_link_1.createLink);
    app.register(get_links_1.getLinks);
};
exports.router = router;
