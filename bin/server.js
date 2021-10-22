const path = require('path');
require('dotenv').config();
const app = require('../app');
const db = require('../model/db');
const createFolderIsExist = require('../helpers/create-dir');

const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, async () => {
    const UPLOAD_DIR = process.env.UPLOAD_DIR;
    const PUBLIC_DIR = process.env.PUBLIC_DIR;
    const AVATARS_OF_USERS = path.join(
      PUBLIC_DIR,
      process.env.AVATARS_OF_USERS,
    );
    await createFolderIsExist(UPLOAD_DIR);
    await createFolderIsExist(PUBLIC_DIR);
    await createFolderIsExist(AVATARS_OF_USERS);
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch(err => {
  console.log(`Server not running. Error message: ${err.message}`);
  process.exit(1);
});
