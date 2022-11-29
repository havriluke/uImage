const serverStore = require('../stores/serverStore')
const imgbbUploader = require('imgbb-uploader')
const { Album, Image, User } = require('../models')
const uuid = require('uuid')
const {statuses} = require('../utils')


class ImageController {
    async add(req, res, next) {
        let imageName, albumName, image, user
        try {
            imageName = req.body.imageName
            albumName = req.body.albumName
            image = req.files.image
            user = req.user
        } catch {
            return res.status(400).json({url: '', message: `Invalid request`})
        }

        if (image.size/1000000 >= parseInt(process.env.MAX_SIZE)) {
            return res.status(400).json({url: '', message: `Max image size is ${process.env.MAX_SIZE}MB. Your image size is ${image.size/1000000}MB`})
        }
        if (image.mimetype.split('/')[0] !== 'image') {
            return res.status(400).json({url: '', message: `This type is not allowed`})
        }

        const mimeType = image.mimetype.split('/')[1]
        imageName = imageName.split('.')[0] + '.' + mimeType

        if (statuses[user.status] !== 0 && user.storage + image.size/1000000 > statuses[user.status]) {
            return res.status(500).json({message: `User ${user.username} reach the limit ${statuses[user.status]}MB. Upgrade your plan`})
        }

        const album = await Album.findOne({name: albumName, userId: user._id})
        if (!album) {
            return res.status(400).json({message: `Album ${albumName} does not existed`})
        }
        const candidate = await Image.findOne({albumId: album._id, name: imageName})
        if (candidate) {
            return res.status(400).json({message: `Image ${imageName} has already exist in ${album.name}`})
        }

        const code = uuid.v4()
        const base64string = new Buffer.from(image.data, 'base64').toString('base64')
        const imgbbData = await imgbbUploader({name: code, apiKey: process.env.IMGBB_API_KEY, base64string})

        const imageModel = new Image({
            imgbbUrl: imgbbData.url,
            url: `image?img=${code}`,
            name: imageName,
            storage: image.size / 1000000,
            albumId: album._id,
            code,
            mimeType: image.mimetype
        })
        imageModel.save()

        await User.updateOne({_id: user._id}, {storage: user.storage + image.size/1000000})

        return res.status(200).json({ url: process.env.URL + imageModel.url })
    }

    async remove(req, res, next) {
        let imageName, albumName, user
        try {
            imageName = req.body.imageName
            albumName = req.body.albumName
            user = req.user
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const album = await Album.findOne({name: albumName, userId: user._id})
        if (!album) {
            return res.status(400).json({message: `Album ${albumName} does not exist`})
        }
        const image = await Image.findOneAndDelete({albumId: album._id, name: imageName})
        if (!image) {
            return res.status(400).json({message: `Image ${imageName} does not exist in ${albumName}`})
        }

        serverStore.deleteImage(image.code + '.' + image.mimeType.split('/')[1])
        console.log('\nStatic RAM: ' + serverStore.info.storage + ' MB\nFiles: ' + serverStore.info.files)

        await User.updateOne({_id: user._id}, {storage: user.storage - image.storage})

        return res.status(200).json({message: `Image ${imageName} was successfully deleted from ${albumName}`})
    }

    async get(req, res, next) {
        let imageCode
        try {
            imageCode = req.query.img
        } catch {
            return res.redirect(`${process.env.URL}00default.jpg`)
        }

        const image = await Image.findOne({code: imageCode})
        if (!image) {
            return res.redirect(`${process.env.URL}00default.jpg`)
        }

        const url = image.imgbbUrl

        imageCode = imageCode + '.' + image.mimeType.split('/')[1]

        serverStore.uploadImage(imageCode, image.storage, url, () => {
            console.log('\nStatic RAM: ' + serverStore.info.storage + ' MB\nFiles: ' + serverStore.info.files)
            return res.redirect(`${process.env.URL}0/${imageCode}`)
        })
    }

    async rename(req, res, next) {
        let user, albumName, imageName, newName
        try {
            user = req.user
            albumName = req.body.albumName
            imageName = req.body.imageName
            newName = req.body.newName
        } catch {
            return res.status(400).json({message: `Invalid request`})
        }

        const album = await Album.findOne({name: albumName, userId: user._id})
        if (!album) {
            return res.status(400).json({message: `Album ${albumName} does not exist`})
        }
        const image = await Image.findOne({albumId: album._id, name: imageName})
        if (!image) {
            return res.status(400).json({message: `Image ${imageName} does not exist in ${albumName}`})
        }

        newName = newName.split('.')[0] + '.' + image.mimeType.split('/')[1]

        await Image.updateOne({albumId: album._id, name: imageName}, {name: newName})

        return res.status(200).json({message: `Image ${imageName} in ${albumName} was renamed to ${newName}`})
    }
}

module.exports = new ImageController()