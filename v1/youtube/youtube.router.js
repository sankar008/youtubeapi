const router = require('express').Router();

const { createPdf, getPdf, deletePdf } = require('./youtube.controller');

router.get('/:id', getPdf);
router.post('/', createPdf);
router.delete('/', deletePdf);

module.exports = router;