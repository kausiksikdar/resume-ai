const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth");
const controller = require("../controllers/resumeController");

router.post("/upload", auth, upload.single("resume"), controller.uploadResume);
router.post("/search", auth, controller.searchResumes);
router.get("/user", auth, controller.getUserResumes);
router.get("/:id", auth, controller.getSingleResume);
router.delete("/:id", auth, controller.deleteResume);

module.exports = router;