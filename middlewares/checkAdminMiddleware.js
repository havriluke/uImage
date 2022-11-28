const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        if (req.user.status === 'ADMIN') {
            next()
        } else {
            return res.status(403).json({message: 'You have not access'})
        }
    } catch(e) {
        res.status(403).json({message: 'You have not access'})
    }
}