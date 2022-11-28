const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const albumController = require('../controllers/albumController')

router.post('/', authMiddleware, albumController.create)
router.delete('/', authMiddleware, albumController.delete)
router.put('/', authMiddleware, albumController.edit)

module.exports = router