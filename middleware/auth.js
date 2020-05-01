const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    req.isAuth = true;
    req.isAdmin = false;
    return next();
  }
  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  if (decodedToken.email === 'dupa@test.pl') {
    req.isAdmin = true;
  }

  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
