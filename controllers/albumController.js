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
        const album = new Album({name, code, isPrivate, userId: user._id})
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

        const album = await Album.findOne({userId: user._id, name})
        
        await Image.deleteMany({albumId: album._id})
        await Album.deleteOne({_id: album._id})

        return res.status(200).json({message: `Album ${name} was successfully deleted`})
    }

    async edit(req, res, next) {
        let name, newName, newIsPrivate, user
        try {
            name = req.body.name
            newName = req.body.newName
            newIsPrivate = req.body.newIsPrivate
            user = req.user
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const candidate = await Album.findOne({name: newName, userId: user._id})
        if (!!candidate && name !== newName) {
            return res.status(400).json({message: `Album ${newName} has already exist`})
        }
        await Album.updateOne({userId: user._id, name}, {name: newName, isPrivate: newIsPrivate})

        return res.status(200).json({message: `Album ${name} was successfully updated`})
    }

}

module.exports = new AlbumController()