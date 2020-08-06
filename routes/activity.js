const router = require("express").Router();
const auth = require("../auth/auth");
const activity = require("../controllers/activity.js");

router.post("/activity", auth, activity.populate);
router.get("/activity", auth, activity.retrieve);
router.get("/activity-web", auth, activity.retrieveWeb);

module.exports = router;
