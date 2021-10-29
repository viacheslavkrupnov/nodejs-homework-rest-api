const express = require('express');
const router = express.Router();

const usersController = require('../../../controllers/usersControllers');
const guard = require('../../../helpers/guard');
const validate = require('./validation');

const upload = require('../../../helpers/upload');

router.post('/signup', validate.createUser, usersController.create);
router.post('/login', usersController.login);
router.post('/logout', guard, usersController.logout);
router.get('/current', guard, usersController.current);
router.patch(
  '/avatars',
  [guard, upload.single('avatar'), validate.updateAvatar],
  usersController.updateAvatar,
);

router.patch(
  '/sub',
  [guard, validate.updateSubscription],
  usersController.updateSubscription,
);

router.get('/verify/:verificationToken', usersController.verifyEmail);

module.exports = router;