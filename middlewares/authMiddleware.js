const {User} = require('../models')

module.exports = function(req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const apiKey = req.headers['x-api-key']
        if (!apiKey) {
            return res.status(401).json({message: 'User has not authorized'})
        }
        User.findOne({apiKey})
            .then((user) => {
                if (!user) return res.status(401).json({message: 'User has not authorized'})
                req.user = user
                next()
            })
    } catch(e) {
        res.status(401).json({message: 'User has not authorized'})
    }
}