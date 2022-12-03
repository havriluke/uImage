const bcrypt = require('bcrypt')
const uuid = require('uuid')
const {User, Album, Image} = require('../models')


function checkNickname(nickname) {
    let isLegit = true
    let regExsp =  /^[A-Za-z]([A-Za-z0-9_]+)$/g
    isLegit =  nickname.match(regExsp) ? isLegit : false
    isLegit = nickname.length > 16 || nickname.length < 4 ? false : isLegit
    return isLegit
}


class UserController {
    async registration(req, res, next) {
        let username, password
        try {
            username = req.body.username
            password = req.body.password
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        if (!checkNickname(username)) {
            return res.status(400).json({message: `Invalid username`})
        }
        if (password.trim().length < 8) {
            return res.status(400).json({message: 'Password must contain at least 8 characters'})
        }
        const hash = req.fingerprint.hash
        let candidate = await User.findOne({hash})
        if (!!candidate) {
            return res.status(400).json({message: `You already have an account ${candidate.username}`})
        }
        candidate = await User.findOne({username})
        if (!!candidate) {
            return res.status(400).json({message: `User ${username} has already exist`})
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const apiKey = uuid.v4()
        const user = new User({username, password: hashPassword, status: 'BASIC', apiKey, storage: 0.0, hash})
        await user.save()
        return res.json({apiKey})
    }

    async login(req, res, next) {
        let username, password
        try {
            username = req.body.username
            password = req.body.password
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({message: `User ${username} does not exist`})
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return res.status(400).json({message: `Incorrect password`})
        }
        const hash = req.fingerprint.hash
        if (user.hash !== hash) {
            await User.updateOne({_id: user._id}, {hash})
        }
        const apiKey = user.apiKey
        return res.json({apiKey})
    }

    async check(req, res, next) {
        await User.updateOne({_id: req.user._id}, {hash: req.fingerprint.hash})
        return res.json({apiKey: req.user.apiKey})
    }

    async edit(req, res, next) {
        let user, newUsername, newPassword
        try {
            newUsername = req.body.newUsername
            newPassword = req.body.newPassword
            user = req.user
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        const candidate = await User.findOne({username: newUsername})
        if (newUsername !== user.username && candidate) {
            return res.status(400).json({message: `User ${newUsername} has already exist`})
        }
        const hashPassword = await bcrypt.hash(newPassword, 5)
        await User.updateOne({_id: user._id}, {username: newUsername, password: hashPassword})

        return res.status(200).json({message: `User ${newUsername} was successfully edited`})
    }

    async editApiKey(req, res, next) {
        let user
        try {
            user = req.user
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        const newApiKey = uuid.v4()
        await User.updateOne({_id: user._id}, {apiKey: newApiKey})

        return res.status(200).json({apiKey: newApiKey})
    }

    async editStatus(req, res, next) {
        let username, status
        try {
            username = req.body.username
            status = req.body.status
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        await User.updateOne({username}, {status})

        return res.status(200).json({message: `User ${username} has ${status} plan`})
    }

    async getSelfInfo(req, res, next) {
        let user
        try {
            user = req.user
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        const albums = await Album.find({userId: user._id})
        const images = await Image.find({albumId: {$in: albums.map((album) => album._id)}})

        const albumsWithImages = albums.map((album) => {
            const images_ = images.filter((image) => album._id.equals(image.albumId))
            return {
                name: album.name,
                storage: images_.map((image) => image.storage).reduce((a, b) => a + b, 0),
                private: album.isPrivate,
                images: images_.map((image) => {
                    return {
                        url: process.env.URL + image.url,
                        name: image.name,
                        storage: image.storage,
                        mimeType: image.mimeType
                    }
                })
            }
        })

        const response = {
            username: user.username,
            status: user.status,
            storage: user.storage,
            apiKey: user.apiKey,
            albums: albumsWithImages
        }
        return res.status(200).json(response)
    }

    async getInfo(req, res, next) {
        let username
        try {
            username = req.query.username
        } catch {
            return res.status(400).json({message: 'Invalid request'})
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({message: `User ${username} does not exist`})
        }

        const albums = await Album.find({userId: user._id, isPrivate: false})
        const images = await Image.find({albumId: {$in: albums.map((album) => album._id)}})

        const albumsWithImages = albums.map((album) => {
            const images_ = images.filter((image) => album._id.equals(image.albumId))
            return {
                name: album.name,
                storage: images_.map((image) => image.storage).reduce((a, b) => a + b, 0),
                images: images_.map((image) => {
                    return {
                        url: process.env.URL + image.url,
                        name: image.name,
                        storage: image.storage,
                        mimeType: image.mimeType
                    }
                })
            }
        })

        const response = {
            username: user.username,
            albums: albumsWithImages
        }

        return res.status(200).json(response)
    }
}

module.exports = new UserController()