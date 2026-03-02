const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many request from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
})

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        success: false,
        message: 'Too many requests, please slow down',
    },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = { authLimiter, apiLimiter };