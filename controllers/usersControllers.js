const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
require('dotenv').config();

const Users = require('../model/users');
const { HttpCode, Status } = require('../helpers/constants');
const {
  downloadAvatarByUrl,
  saveAvatarToStatic,
  deletePreviousAvatar,
} = require('../helpers/avatar-handler');

const EmailService = require('../services/email-verification');
const SECRET_KEY = process.env.JWT_SECRET;

async function create(req, res, next) {
  try {
    const { email, name } = req.body;

    const user = await Users.findByEmail(email);
    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: Status.ERROR,
        code: HttpCode.CONFLICT,
        data: 'Conflict',
        message: 'Email is already in use',
      });
    }

    // create verification token
    const verificationToken = nanoid();

    // send verification email
    const emailService = new EmailService(process.env.NODE_ENV);
    await emailService.sendVerificationEmail(verificationToken, email, name);


    // create user in db
    const newUser = await Users.createUser({
      ...req.body,
      verified: false,
      verificationToken,
    });

    const { pathToTmpFolder, fileName } = await downloadAvatarByUrl(newUser);
    const newAvatarUrl = await saveAvatarToStatic(
      newUser.id,
      pathToTmpFolder,
      fileName,
    );
    await Users.updateAvatarUrl(newUser.id, newAvatarUrl);

    return res.status(HttpCode.CREATED).json({
      status: Status.SUCCESS,
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatar,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    const isPasswordValid = await user?.validPassword(password);

    if (!user || !isPasswordValid) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: Status.ERROR,
        code: HttpCode.UNAUTHORIZED,
        data: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const id = user._id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '3h' });
    await Users.updateToken(id, token);

    return res.status(HttpCode.OK).json({
      status: Status.SUCCESS,
      code: HttpCode.OK,
      data: {
        token,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    const id = req.user.id;
    await Users.updateToken(id, null);
    return res.status(HttpCode.NO_CONTENT).json({});
  } catch (e) {
    next(e);
  }
}

async function current(req, res, next) {
  try {
    return res.status(HttpCode.OK).json({
      status: Status.SUCCESS,
      code: HttpCode.OK,
      data: {
        id: req.user.id,
        email: req.user.email,
        subscription: req.user.subscription,
        avatar: req.user.avatarURL,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function updateSubscription(req, res, next) {
  try {
    const id = req.user.id;
    const subscription = req.body.subscription;
    await Users.updateSubscription(id, subscription);

    return res.status(HttpCode.OK).json({
      status: Status.SUCCESS,
      code: HttpCode.OK,
      data: {
        id: req.user.id,
        email: req.user.email,
        subscription,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function updateAvatar(req, res, next) {
  try {
    const id = req.user.id;
    const pathFile = req.file.path;
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const newAvatarUrl = await saveAvatarToStatic(id, pathFile, fileName);
    await Users.updateAvatarUrl(id, newAvatarUrl);
    await deletePreviousAvatar(req.user.avatarURL);

    return res.status(HttpCode.OK).json({
      status: Status.SUCCESS,
      code: HttpCode.OK,
      data: { newAvatarUrl },
    });
  } catch (e) {
    next(e);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const user = await Users.findUserByVerificationToken(
      req.params.verificationToken,
    );

    if (user) {
      await Users.updateVerificationToken(user._id, true, null);

      return res.status(HttpCode.OK).json({
        status: Status.SUCCESS,
        code: HttpCode.OK,
        message: 'Verification successful',
      });
    }

    return res.status(HttpCode.BAD_REQUEST).json({
      status: Status.ERROR,
      code: HttpCode.BAD_REQUEST,
      data: 'Bad request',
      message: 'Verification has already been passed',
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  login,
  logout,
  current,
  updateSubscription,
  updateAvatar,
  verifyEmail,
};