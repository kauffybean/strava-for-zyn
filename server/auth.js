const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const util = require('util');
const { storage } = require('./storage');

const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  try {
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

function setupAuth(app) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    },
    store: storage.sessionStore,
  };

  app.set('trust proxy', 1);
  app.use(require('express-session')(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        console.warn(`User with id ${id} not found during session deserialize`);
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Session deserialize error:', error);
      done(error);
    }
  });

  app.post('/api/register', async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: 'Invalid username or password' });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'Failed to logout' });
      res.sendStatus(200);
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Add a session check endpoint
  app.get('/api/session-check', (req, res) => {
    // Simple endpoint to validate session is working
    if (req.isAuthenticated()) {
      return res.status(200).json({ 
        authenticated: true,
        userId: req.user.id,
        username: req.user.username
      });
    }
    return res.status(200).json({ authenticated: false });
  });
}

module.exports = { setupAuth };