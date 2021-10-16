const passport = require('passport');
require('../config/passport');
const { HttpCode, Status } = require('./constants');

const guard = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    const [, token] = req.get('Authorization').split(' ');

    if (!user || err || token !== user.token) {
      return res.status(HttpCode.FORBIDDEN).json({
        status: Status.ERROR,
        code: HttpCode.UNAUTHORIZED,
        data: 'Unauthorized',
        message: 'Not authorized',
      });
    }

    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = guard;