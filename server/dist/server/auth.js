"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuth = setupAuth;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const crypto_1 = require("crypto");
const util_1 = require("util");
const storage_1 = require("./storage");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64));
    return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
}
function setupAuth(app) {
    // Passport initialization - IMPORTANT: passport.session() must be used AFTER express-session middleware
    // The express-session middleware is already configured in app.js
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
        try {
            const user = await storage_1.storage.getUserByUsername(username);
            if (!user || !(await comparePasswords(password, user.password))) {
                return done(null, false);
            }
            else {
                return done(null, user);
            }
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => done(null, user.id));
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await storage_1.storage.getUser(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
    app.post("/api/register", async (req, res, next) => {
        try {
            const existingUser = await storage_1.storage.getUserByUsername(req.body.username);
            if (existingUser) {
                res.status(400).json({ error: "Username already exists" });
                return;
            }
            const user = await storage_1.storage.createUser({
                ...req.body,
                password: await hashPassword(req.body.password),
                createdAt: new Date()
            });
            req.login(user, (err) => {
                if (err) {
                    next(err);
                    return;
                }
                res.status(201).json(user);
            });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/login", (req, res, next) => {
        passport_1.default.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            req.login(user, (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                return res.status(200).json(user);
            });
        })(req, res, next);
    });
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) {
                next(err);
                return;
            }
            res.sendStatus(200);
        });
    });
    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) {
            res.sendStatus(401);
            return;
        }
        res.json(req.user);
    });
}
