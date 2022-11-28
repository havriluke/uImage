const {User, Album} = require('../models')

module.exports = function(req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const albumCode = req.query.img.split('---')[0]
        Album.findOne({code: albumCode})
            .then((album) => {
                if (!album.isPrivate) {
                    next()
                } else {
                    const apiKey = req.headers['x-api-key']
                    if (!apiKey) {
                        return res.status(500).json({message: 'No access'})
                    }
                    User.findOne({apiKey})
                        .then((user) => {
                            if (!user) return res.status(500).json({message: 'No access'})
                            if (!album.userId.equals(user._id)) return res.status(500).json({message: 'No access'})
                            next()
                        })
                }
                
            })
    } catch(e) {
        return res.status(500).json({message: 'No access'})
    }
}