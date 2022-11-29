const router = require("express").Router()
const EmployeesController = require("../controllers/EmployeesController")
router.post("/sign-in",EmployeesController.signIn)
router.post("/",EmployeesController.signUp)
// router.get()
// router.put()
// router.delete()





module.exports = router