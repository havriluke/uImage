const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const albumController = require('../controllers/albumController')

router.post('/', authMiddleware, albumController.create)
router.delete('/', authMiddleware, albumController.delete)
router.put('/', authMiddleware, albumController.rename)

router.put('/access/add', authMiddleware, albumController.addAccess)
router.put('/access/remove', authMiddleware, albumController.removeAccess)

module.exports = router