const { transformEvent } = require('./utils');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = async () => {
  try {
    const events = await Event.find();
    return events.map((event) => transformEvent(event));
  } catch (error) {
    throw error;
  }
};

const createEvent = async ({ eventInput }, { isAuth, userId }) => {
  if (!isAuth) {
    throw new Error('Unauthenticated!');
  }

  const { title, description, price, date } = eventInput;
  const newEvent = new Event({
    title,
    description,
    price,
    date: new Date(date),
    creator: userId,
  });

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.createdEvents.push(newEvent);
    await user.save();

    const savedEvent = await newEvent.save();
    return transformEvent(savedEvent);
  } catch (error) {
    throw error;
  }
};

module.exports = { events, createEvent };
