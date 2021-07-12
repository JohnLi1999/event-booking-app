const { transformBooking, transformEvent } = require('./utils');
const Event = require('../../models/event');
const Booking = require('../../models/booking');

const bookings = async (_, { isAuth, userId }) => {
  if (!isAuth) {
    throw new Error('Unauthenticated!');
  }

  try {
    const bookings = await Booking.find({ user: userId });
    return bookings.map((booking) => transformBooking(booking));
  } catch (error) {
    throw error;
  }
};

const bookEvent = async ({ eventId }, { isAuth, userId }) => {
  if (!isAuth) {
    throw new Error('Unauthenticated!');
  }

  try {
    const fetchedEvent = await Event.findOne({ _id: eventId });
    const newBooking = new Booking({
      user: userId,
      event: fetchedEvent,
    });
    const savedBooking = await newBooking.save();
    return transformBooking(savedBooking);
  } catch (error) {
    throw error;
  }
};

const cancelBooking = async ({ bookingId }, { isAuth }) => {
  if (!isAuth) {
    throw new Error('Unauthenticated!');
  }

  try {
    const booking = await Booking.findById(bookingId).populate('event');
    const event = transformEvent(booking.event);
    await Booking.deleteOne({ _id: bookingId });
    return event;
  } catch (error) {
    throw error;
  }
};

module.exports = { bookings, bookEvent, cancelBooking };
