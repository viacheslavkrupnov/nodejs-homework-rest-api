const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const fileType = require('file-type');
const Jimp = require('jimp');
require('dotenv').config();

const createFolderIsExist = require('./create-dir');

const UPLOAD_DIR = process.env.UPLOAD_DIR;
const PUBLIC_DIR = process.env.PUBLIC_DIR;
const AVATARS_OF_USERS = path.join(PUBLIC_DIR, process.env.AVATARS_OF_USERS);

async function downloadAvatarByUrl(user) {
  const avatarURL = user.avatarURL;
  const downloadedAvatar = await fetch(avatarURL);
  const downloadedAvatarBinary = await downloadedAvatar.buffer();
  const type = await fileType.fromBuffer(downloadedAvatarBinary);
  const fileName = `${user.id}.${type.ext}`;
  const pathToTmpFolder = path.join(UPLOAD_DIR, fileName);
  await fs.writeFile(pathToTmpFolder, downloadedAvatarBinary);
  return { pathToTmpFolder, fileName };
}

async function saveAvatarToStatic(userId, pathToFile, fileName) {
  const img = await Jimp.read(pathToFile);
  await img
    .autocrop()
    .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
    .writeAsync(pathToFile);
  await createFolderIsExist(path.join(AVATARS_OF_USERS, userId));
  await fs.rename(pathToFile, path.join(AVATARS_OF_USERS, userId, fileName));
  const newAvatarUrl = path.normalize(path.join(userId, fileName));
  return newAvatarUrl;
}

async function deletePreviousAvatar(prevAvatarUrl) {
  const PUBLIC_DIR = process.env.PUBLIC_DIR;
  const AVATARS_OF_USERS = path.join(PUBLIC_DIR, process.env.AVATARS_OF_USERS);
  try {
    await fs.unlink(path.join(process.cwd(), AVATARS_OF_USERS, prevAvatarUrl));
  } catch (e) {
    console.log(e.message);
  }
}

module.exports = {
  downloadAvatarByUrl,
  saveAvatarToStatic,
  deletePreviousAvatar,
};