/**
 * Firebase Cloud Functions entry point.
 *
 * Exports scheduled jobs and other automation utilities.
 */

const { resetDailyOffers } = require("./resetDailyOffers");

exports.resetDailyOffers = resetDailyOffers;
