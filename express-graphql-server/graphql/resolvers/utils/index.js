const DataLoader = require('dataloader');

const Event = require('../../../models/event');
const User = require('../../../models/user');
const { dateToString } = require('../../../utils/date');

const eventLoader = new DataLoader((eventIds) => chainedEvents(eventIds));

const userLoader = new DataLoader((userIds) =>
  User.find({ _id: { $in: userIds } })
);

const chainedEvent = async (eventId) => {
  try {
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (error) {
    throw error;
  }
};

const chainedEvents = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.sort(
      (a, b) =>
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
    );
    return events.map((event) => transformEvent(event));
  } catch (error) {
    throw error;
  }
};

const chainedUser = async (userId) => {
  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      createdEvents: () => eventLoader.loadMany(user.createdEvents),
    };
  } catch (error) {
    throw error;
  }
};

const transformBooking = (booking) => ({
  ...booking._doc,
  user: chainedUser.bind(this, booking.user),
  event: chainedEvent.bind(this, booking.event),
  createdAt: dateToString(booking._doc.createdAt),
  updatedAt: dateToString(booking._doc.updatedAt),
});

const transformEvent = (event) => ({
  ...event._doc,
  date: dateToString(event._doc.date),
  creator: chainedUser.bind(this, event.creator),
});

module.exports = {
  chainedEvent,
  chainedEvents,
  chainedUser,
  transformBooking,
  transformEvent,
};
