// ems-backend/routes/documents.routes.js
const express = require('express');
const documentsController = require('../controllers/documents.controller');
const verifyToken = require('../middleware/verifyToken');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

module.exports = function(pool) {
  const router = express.Router();

  router.use(verifyToken);
  router.use(adminAuth);

  // List all documents (admin)
  router.get('/', (req, res) => documentsController.getAllDocuments(req, res, pool));

  // Upload (add) document (file upload)
  router.post('/', upload.single('file'), (req, res) =>
    documentsController.uploadDocument(req, res, pool)
  );

  // View particular document
  router.get('/:id', (req, res) => documentsController.getDocumentById(req, res, pool));

  // Download document file
  router.get('/:id/download', (req, res) => documentsController.downloadDocument(req, res, pool));

  // Edit/update document (optionally with file upload)
  router.put('/:id', upload.single('file'), (req, res) =>
    documentsController.updateDocument(req, res, pool)
  );

  // Delete document
  router.delete('/:id', (req, res) => documentsController.deleteDocument(req, res, pool));

  return router;
};
