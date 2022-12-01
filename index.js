require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const router = require('./routes/index')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const PORT = process.env.PORT || 5000
const http = require('http')
const path = require('path')
const fs = require('fs')
const Fingerprint = require('express-fingerprint')

const app = express()

app.use(cors({origin: true}))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use(Fingerprint())
app.use('/', router)

const server = http.createServer(app)

const start = async () => {
    try {
        mongoose
            .connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
            .then(() => console.log('MongoDB was connected successfully'))
            .catch((e) => console.log(e))
        server.listen(PORT, () => console.log(`Server starts on port ${PORT}`))
    } catch(e) {
        console.log(e)
    }
}

start()