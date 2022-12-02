const router = require("express").Router()
const EmployeesController = require("../controllers/EmployeesController")
router.post("/sign-in",EmployeesController.signIn)
router.post("/sign-up",EmployeesController.signUp)
router.post("/reset",EmployeesController.sendEmail)
// router.get()
// router.put()
// router.delete()





module.exports = router