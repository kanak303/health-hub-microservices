import express from 'express';
import ConfigController from '../controllers/configController.js';

const router = express.Router();

router.get('/', ConfigController.getAllConfigs);
router.get('/category/:category', ConfigController.getConfigsByCategory);
router.get('/:key', ConfigController.getConfigByKey);
router.post('/', ConfigController.createConfig);
router.put('/:key', ConfigController.updateConfig);
router.delete('/:key', ConfigController.deleteConfig);

export default router;