const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

const createUser = async ({ userInput }) => {
  const { email, password } = userInput;

  try {
    const user = await User.findOne({ email });
    if (user) {
      throw new Error('User exists already');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.BCRYPT_SALT
    );
    const newUser = await new User({
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    return { ...savedUser._doc, password: null };
  } catch (error) {
    throw error;
  }
};

const login = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN_TEXT,
      }
    );
    return {
      userId: user.id,
      token,
      tokenExpiration: +process.env.JWT_EXPIRES_IN_NUM,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { createUser, login };
