const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth")

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post('/logout', auth, authController.logout);
router.post("/change-password", auth, authController.changePassword);
router.get("/me", auth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;
