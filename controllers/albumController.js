const {User, Album, Image} = require('../models')
const uuid = require('uuid')

class AlbumController {
    async create(req, res, next) {
        let name, user, isPrivate
        try {
            name = req.body.name
            isPrivate = req.body.isPrivate
            user = req.user
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const candidate = await Album.findOne({userId: user._id, name})
        if (!!candidate) {
            return res.status(400).json({message: `Album ${name} has already exist`})
        }

        const code = uuid.v4()
        const album = new Album({name, code, isPrivate, userId: user._id, accessIds: [user._id]})
        album.save()

        return res.status(200).json({message: `Album ${name} was successfully created`})
    }

    async delete(req, res, next) {
        let name, user
        try {
            name = req.query.name
            user = req.user
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const album = await Album.findOne({userId: user._id})
        await User.updateOne({_id: user._id}, {storage: user.storage - album.storage})

        await Image.deleteMany({albumId: album._id})
        await Album.deleteOne({_id: album._id})

        return res.status(200).json({message: `Album ${name} was successfully deleted`})
    }

    async rename(req, res, next) {
        let name, newName, user
        try {
            name = req.body.name
            newName = req.body.newName
            user = req.user
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const candidate = await Album.findOne({name: newName, userId: user._id})
        if (!!candidate && name !== newName) {
            return res.status(400).json({message: `Album ${newName} has already exist`})
        }
        await Album.updateOne({userId: user._id, name}, {name: newName})

        return res.status(200).json({message: `Album ${name} was successfully renamed`})
    }

    async addAccess(req, res, next) {
        let user, albumName, username
        try {
            user = req.user
            albumName = req.body.albumName
            username = req.body.username
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const album = await Album.findOne({userId: user._id, name: albumName})
        if (!album) {
            return res.status(400).json({message: `Album does not exist`})
        }
        const userModel = await User.findOne({username})
        if (!userModel) {
            return res.status(400).json({message: `User ${username} does not exist`})
        } else if (album.accessIds.includes(userModel._id)) {
            return res.status(400).json({message: `User ${username} have already have access to ${albumName}`})
        }

        const accessIds = [...album.accessIds, userModel._id]
        await Album.updateOne({_id: album._id}, {accessIds})
        return res.status(200).json({message: `User ${username} have access to ${albumName} now`})
    }

    async removeAccess(req, res, next) {
        let user, albumName, username
        try {
            user = req.user
            albumName = req.body.albumName
            username = req.body.username
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const album = await Album.findOne({userId: user._id, name: albumName})
        if (!album) {
            return res.status(400).json({message: `Album does not exist`})
        }
        const userModel = await User.findOne({username})
        if (!userModel) {
            return res.status(400).json({message: `User ${username} does not exist`})
        } else if (!album.accessIds.includes(userModel._id) || userModel._id.equals(user._id)) {
            return res.status(400).json({message: `You can not add user ${username} to ${albumName}`})
        }

        const accessIds = album.accessIds.filter((id) => !id.equals(userModel._id))
        await Album.updateOne({_id: album._id}, {accessIds})
        return res.status(200).json({message: `User ${username} have not access to ${albumName} now`})
    }

}

module.exports = new AlbumController()