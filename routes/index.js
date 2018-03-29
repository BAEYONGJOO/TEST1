var express = require('express');
var router = express.Router();

router.get('/test', function(req, res, next) {
  res.render('test', { title: 'TEST1' });
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TEST1' });
});


module.exports = router;
