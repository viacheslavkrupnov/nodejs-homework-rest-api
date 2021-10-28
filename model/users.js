const User = require('./schemas/user');

async function createUser(body) {
  const user = await User.create(body);
  return user;
}

async function findByEmail(email) {
  const user = await User.findOne({ email });
  return user;
}

async function findById(id) {
  const user = await User.findOne({ _id: id });
  return user;
}

async function updateToken(id, token) {
  return await User.updateOne({ _id: id }, { token });
}

async function updateSubscription(id, subscription) {
  return await User.updateOne({ _id: id }, { subscription });
}

async function updateAvatarUrl(id, url) {
  return await User.updateOne({ _id: id }, { avatarURL: url });
}

async function findUserByVerificationToken(verificationToken) {
  return await User.findOne({ verificationToken });
}

async function updateVerificationToken(id, verified, verificationToken) {
  return await User.findOneAndUpdate(
    { _id: id },
    { verified, verificationToken },
  );
}

module.exports = {
  createUser,
  findByEmail,
  updateToken,
  findById,
  updateSubscription,
  updateAvatarUrl,
  findUserByVerificationToken,
  updateVerificationToken,
};