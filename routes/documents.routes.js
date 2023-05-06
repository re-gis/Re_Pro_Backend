const express = require('express')
const { deleteDoc } = require('../controllers/documents.controller')
const protect = require('../middlewares/userAuth')
const documentRouter = express.Router()


// Delete a document
documentRouter.delete('/:user/doc/:id/delete', protect, deleteDoc)

module.exports = documentRouter