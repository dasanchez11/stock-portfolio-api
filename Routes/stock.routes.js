const express = require('express');
const router = express.Router();
const stockController = require('../Controllers/stock.controller')
const isAuth = require('../Middleware/isAuthenticated')


router.post('/getstock',isAuth,stockController.getStock)
router.post('/addstock', isAuth,stockController.addStock)
router.get('/findstocks',isAuth,stockController.findStocks)
router.delete('/removestock',isAuth,stockController.removeStock)
router.patch('/editstock',isAuth,stockController.editStock)
router.post('/searchStock',stockController.searchStock)







module.exports = router;