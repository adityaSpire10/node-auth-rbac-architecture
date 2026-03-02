import express from 'express'
import cors from 'cors'
import helmet from 'helmet';
import session from 'express-session';
import * as bodyParser from "body-parser";
import dataFilter from "./middlewares/filter"
import { I18n } from 'i18n';
import { apiLimiter } from './middlewares/rateLimiter';
import {errorHandler} from './middlewares/errorHandler'
require('dotenv').config();
import config from "./config"
const morgan = require('morgan');
import path from 'path'

const app = express();

// Security Headers
app.use(helmet())

// CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || config.cors.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}))

// Session
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.session.maxAge,
    }
}))

// Body Parsing
app.use(bodyParser.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Apply GET api Filter Data
app.use(dataFilter);

// Logging
const logger = require('./config/logger');
app.use(
    morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
        skip: (req) => req.url === '/health',
    })
)

// Multilinguistic Response
//  Set Language
export const i18n = new I18n({
  locales: ["en"],
  directory: path.join(__dirname, "transaltion"),
  defaultLocale: "en",
  // enable object notation
  objectNotation: true,
  header: "locale",
});
app.use(i18n.init);

// ── Global Rate Limiter ───────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/v1", require("./routes/index.routes"))

// ── Static Files ──────────────────────────────────────────────
app.use("/public", express.static(path.join(__dirname, "../public")));

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;