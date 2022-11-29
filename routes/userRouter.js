const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const userController = require('../controllers/userController')
const checkAdminMiddleware = require('../middlewares/checkAdminMiddleware')

// router.get('/confirm', authMiddleware, userController.confirmPassword)
router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.put('/', authMiddleware, userController.edit)
router.put('/api-key', authMiddleware, userController.editApiKey)
router.get('/self-info', authMiddleware, userController.getSelfInfo)
router.get('/info', userController.getInfo)

router.put('/status', authMiddleware, checkAdminMiddleware, userController.editStatus)

module.exports = router