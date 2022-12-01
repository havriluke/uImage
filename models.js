const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: { type: String, required: true  },
    password: { type: String, required: true },
    status: { type: String, required: true },
    apiKey: { type: String, required: true },
    storage: { type: Number, required: true},
    hash: { type: String, required: true }
}, {timestamps: true})


const albumSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    userId: { type: Object, required: true },
    isPrivate: { type: Boolean, required: true },
    accessIds: { type: Array, required: true }
}, {timestamps: true})


const imageSchema = new Schema({
    imgbbUrl: { type: String, required: true },
    url: { type: String, required: true },
    name: { type: String, required: true },
    storage: { type: Number, required: true },
    albumId: { type: Object, required: true },
    code: { type: String, required: true },
    mimeType: { type: String, required: true }
}, {timestamps: true})


const User = mongoose.model('User', userSchema)
const Album = mongoose.model('Album', albumSchema)
const Image = mongoose.model('Image', imageSchema)

module.exports = { User, Album, Image }