const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const imageController = require('../controllers/imageController')
const privateMiddleware = require('../middlewares/privateMiddleware')

router.post('/', authMiddleware, imageController.add)
router.delete('/', authMiddleware, imageController.remove)
router.put('/', authMiddleware, imageController.rename)

router.get('/0/:img', imageController.get)

module.exports = router