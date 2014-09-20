var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/check', function(req, res) {
    if (req.isAuthenticated()) {
            res.json({
                authenticated: true,
                token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // dv: this is just an example, we should do real authentication
                user: req.user
            })
        } else {
            res.json({
                authenticated: false,
                token: null,
                user: null
            })
        }
});

// dv: simple authentication by hardcoded login and password
router.post('/simple.json', function(req, res) {
    var body = req.body,
        login = body.login,
        password = body.password;
    if (login == 'true' && password == 'cron') {
        res.send({
            success: true,
            token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // dv: this is just an example, we should do real authentication
        });
    } else {
        res.send({
            success: false,
            message: 'Invalid login/password'
        });
    }
});

module.exports = router;
