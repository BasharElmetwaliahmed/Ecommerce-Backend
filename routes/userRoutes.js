const express = require("express");
const { signUp, login } = require("../controllers/authController");
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/login",(req,res)=>{
    res.send('succes')
})


module.exports = router;