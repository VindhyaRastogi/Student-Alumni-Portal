const express = require("express");
const { getMessages } = require("../controllers/chatController");
const router = express.Router();

router.get("/:userId/:otherUserId", getMessages);

module.exports = router;
