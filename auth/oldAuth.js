const authenticate = async ({email, ipAddress}) => {
  // Generate token
  const user = await UserModel.findOne({email});

  const jwtToken = generateJwt(user);
  const refreshToken = generateRefreshToken(user, ipAddress);
  // console.log(refreshToken)
  await refreshToken.save();
  console.log(jwtToken);
  console.log(refreshToken);
  return {
    user,
    jwtToken,
    refreshToken: refreshToken.token,
  };
};

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie('refreshToken', token, cookieOptions);
};

const refreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  refreshJwtToken({token, ipAddress})
    .then(({refreshToken, ...user}) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
};

const refreshJwtToken = async ({token, ipAddress}) => {
  const refreshToken = await getRefreshToken(token);
  const {user} = refreshToken;

  // Replace old refresh token with new one and save
  const newRefreshToken = generateRefreshToken(user, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // Generate new JWT
  const jwtToken = generateJwt(user);

  const {name, surname, email} = user;
  return {
    name,
    surname,
    email,
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
};

const generateRefreshToken = (user, ipAddress) =>
  // Create refresh token that expires in 7 days
  new RefreshTokenModel({
    user: user._id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });

const revokeTokenSchema = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().empty(''),
  });
  validateRequest(req, next, schema);
};

const revokeToken = async ({token, ipAddress}) => {
  const refreshToken = await getRefreshToken(token);
  console.log(refreshToken);
  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
  console.log(refreshToken);
};

const secret = process.env.TOKEN_SECRET;
function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    jwt({secret, algorithms: ['HS256']}),
    async (req, res, next) => {
      console.log('hey');
      // const currentUser = req.user.email;
      const user = await UserModel.findById(req.user.id);
      console.log('hey');
      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(401).json({message: 'Unauthorized'});
      }

      req.user.role = user.role;

      const refreshTokens = await RefreshTokenModel.find({user: user._id});
      req.user.ownsToken = token =>
        !!refreshTokens.find(x => x.token === token);
      next();
    },
  ];
}
async function revokedToken(req, res, next) {
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  console.log(req.user);
  if (!token) return res.status(400).json({message: 'Token is required'});

  if (!req.user.ownsToken(token) && req.user.role !== 'manager') {
    return res.status.json({message: 'Unauthorized'});
  }

  revokeToken({token, ipAddress})
    .then(() => res.json({message: 'Token revoked'}))
    .catch(next);
}

const signIn = async function (req, res, next) {
  const {email} = req.body;
  const ipAddress = req.ip;
  authenticate({email, ipAddress})
    .then(({refreshToken, ...user}) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
};
