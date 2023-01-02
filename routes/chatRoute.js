const router = require("express").Router()
const ChatsController = require("../controllers/ChatsController")
router.post("/checkAlreadyInvited",ChatsController.checkAlreadyInvited)
router.post("/respondOnInvitation",ChatsController.respondOnInvitation)
router.post("/allEmployees",ChatsController.allEmployees)
router.post("/accessChatMessages",ChatsController.accessChatMessages)
router.post("/sendAnInvite",ChatsController.sendAnInvite)
router.post("/sendMessage",ChatsController.sendMessage)
router.post("/accessChatUsers",ChatsController.accessChatUsers)

module.exports = router