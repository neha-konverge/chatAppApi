const router = require("express").Router()
const ChatsController = require("../controllers/ChatsController")
router.post("/checkAlreadyInvited",ChatsController.checkAlreadyInvited)
router.post("/sendAnInvite",ChatsController.sendAnInvite)
router.post("/allEmployees",ChatsController.allEmployees)
router.post("/accessChats",ChatsController.accessChats)

module.exports = router