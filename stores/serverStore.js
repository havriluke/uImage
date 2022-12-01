const https = require('https')
const fs = require('fs')

class ServerStore {

    constructor() {
        this._storage = 0
        this._storageLimit = 320
        this._imgs = []
    }

    

    uploadImage(image, storage, url, redirectFunc) {
        const pathToFile = `./static/0/${image}`
        if (fs.existsSync(pathToFile)) {
            redirectFunc()
            return
        }

        while (this._storage + storage > this._storageLimit) {
            const deleteImage = this._imgs[0]
            fs.unlinkSync(`./static/0/${deleteImage.name}`)
            this._storage -= deleteImage.storage
            this._imgs = this._imgs.filter((img, i) => i !== 0)
        }

        const file = fs.createWriteStream(pathToFile)
        https.get(url, (response) => {
            response.pipe(file)
            file.on("finish", () => {
                this._imgs.push({name: image, storage})
                this._storage += storage
                file.close(redirectFunc)
            }).on('error', () => {
                fs.unlinkSync(pathToFile)
            })
        })

    }

    uploadPrivateImage(image, url, redirectFunc) {
        const pathToFile = `./static/0/secure/${image}`
        const file = fs.createWriteStream(pathToFile)
        https.get(url, (response) => {
            response.pipe(file)
            file.on("finish", () => {
                file.close(redirectFunc)
                setTimeout(() => fs.unlinkSync(pathToFile), 1000)
            }).on('error', () => {
                fs.unlinkSync(pathToFile)
            })
        })
    }

    deleteImage(image) {
        if (fs.existsSync(`./static/0/${image}`)) {
            fs.unlinkSync(`./static/0/${image}`)
            this._storage -= this._imgs.filter((img) => img.name === image)[0].storage
            this._imgs = this._imgs.filter((img) => img.name !== image)
        }
    }

    get info() {
        return {storage: this._storage, files: this._imgs.length}
    }
}

module.exports = new ServerStore()
