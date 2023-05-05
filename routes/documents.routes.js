const express = require('express')
const { createDocument } = require('../controllers/documents.controller')
const protect = require('../middlewares/userAuth')
// const documentRouter = express.Router()


// // create a document
// documentRouter.post('/:user/create', protect, createDocument)

// module.exports = documentRouter