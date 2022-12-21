const router = require("express").Router()
const ChatsController = require("../controllers/ChatsController")
router.post("/checkAlreadyInvites",ChatsController.checkAlreadyInvited)
router.post("/sendAnInvite",ChatsController.sendAnInvite)
router.post("/allEmployees",ChatsController.allEmployees)

module.exports = router