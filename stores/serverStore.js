const https = require('https')
const fs = require('fs')
const path = require('path')

class ServerStore {

    constructor() {
        this._storage = 0
        this._storageLimit = 320
        this._imgs = []
    }

    

    uploadImage(image, storage, url, redirectFunc) {
        if (fs.existsSync(path.join(__dirname, `../static/0/${image}`))) {
            redirectFunc()
            return
        }

        while (this._storage + storage > this._storageLimit) {
            const deleteImage = this._imgs[0]
            fs.unlinkSync(path.join(__dirname, `../static/0/${deleteImage.name}`))
            this._storage -= deleteImage.storage
            this._imgs = this._imgs.filter((img, i) => i !== 0)
        }

        const file = fs.createWriteStream(path.join(__dirname, `../static/0/${image}`))
        https.get(url, (response) => {
            response.pipe(file)
            file.on("finish", () => {
                this._imgs.push({name: image, storage})
                this._storage += storage
                file.close(redirectFunc)
            }).on('error', () => {
                fs.unlink(file)
            })
        })

    }

    deleteImage(image) {
        if (fs.existsSync(path.join(__dirname, `../static/0/${image}`))) {
            fs.unlinkSync(path.join(__dirname, `../static/0/${image}`))
            this._storage -= this._imgs.filter((img) => img.name === image)[0].storage
            this._imgs = this._imgs.filter((img) => img.name !== image)
        }
    }
}

module.exports = new ServerStore()
