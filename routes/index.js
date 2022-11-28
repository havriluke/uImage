const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const albumRouter = require('./albumRouter')
const imageRouter = require('./imageRouter')

router.use('/api/user', userRouter)
router.use('/api/album', albumRouter)
router.use('/api/image', imageRouter)

router.use('/', imageRouter)

module.exports = router
