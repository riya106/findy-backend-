const express = require("express")
const router = express.Router()

const { getAroundPlaces } = require("../controllers/aroundController")

router.get("/", getAroundPlaces)

module.exports = router