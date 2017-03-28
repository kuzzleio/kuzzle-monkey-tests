/**
 * @typedef {{
 *  clients: Set.<Client>,
 *  subscriptions: Set.<Subscription>
 * }} Room
 *
 *
 * @typedef {{
 *  all: Map.<string, Room>,
 *  byIndex: Map.<string, Map.<string, Map.<string, Room>>>
 * }} Rooms
 */
