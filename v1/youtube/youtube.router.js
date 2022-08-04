const router = require('express').Router();

const { createPdf, saveData, getPdf, generatePdf, savePdf, deletePdf } = require('./youtube.controller');

router.get('/:id', getPdf);
router.post('/', createPdf);
router.post('/save', saveData);
router.patch('/save-pdf', savePdf);
router.get('/generate-pdf/:id', generatePdf);
router.delete('/', deletePdf);

module.exports = router;