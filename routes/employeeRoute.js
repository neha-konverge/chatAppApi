const router = require("express").Router()
const EmployeesController = require("../controllers/EmployeesController")
router.post("/sign-in",EmployeesController.signIn)
router.post("/sign-up",EmployeesController.signUp)
router.post("/forgotPassword",EmployeesController.forgotPassword)
router.post("/checkResetPasswordRequest",EmployeesController.checkResetPasswordRequest)
router.post("/resetPassword",EmployeesController.resetPassword)
router.post("/verifyEmail",EmployeesController.verifyEmail)
router.post("/sendVerificationEmail",EmployeesController.sendVerificationEmail)
// router.get()
// router.put()
// router.delete()





module.exports = router