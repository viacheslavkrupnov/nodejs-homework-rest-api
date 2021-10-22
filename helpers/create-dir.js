const fs = require('fs').promises;

async function isAccessible(path) {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

async function createFolderIsExist(folder) {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
}

module.exports = createFolderIsExist;