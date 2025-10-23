import Config from '../models/Config.js';
import Joi from 'joi';

const configSchema = Joi.object({
    key: Joi.string().required(),
  value: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().optional(),
  data_type: Joi.string().valid('string', 'number', 'boolean', 'json').default('string')
});

const updateSchema = Joi.object({
  value: Joi.string().required(),
  description: Joi.string().optional()
});

class ConfigController {
  static async getAllConfigs(req, res) {
    try {
      const configs = await Config.getAll();
      res.json({ success: true, data: configs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getConfigsByCategory(req, res) {
    try {
      const { category } = req.params;
      const configs = await Config.getByCategory(category);
      res.json({ success: true, data: configs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getConfigByKey(req, res) {
    try {
      const { key } = req.params;
      const config = await Config.getByKey(key);
      if (!config) {
        return res.status(404).json({ success: false, error: 'Config not found' });
      }
      res.json({ success: true, data: config });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createConfig(req, res) {
    try {
      const { error, value } = configSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const config = await Config.create(value);
      res.status(201).json({ success: true, data: config });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateConfig(req, res) {
    try {
      const { key } = req.params;
      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const config = await Config.update(key, value);
      if (!config) {
        return res.status(404).json({ success: false, error: 'Config not found' });
      }
      res.json({ success: true, data: config });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteConfig(req, res) {
    try {
      const { key } = req.params;
      const config = await Config.delete(key);
      if (!config) {
        return res.status(404).json({ success: false, error: 'Config not found' });
      }
      res.json({ success: true, message: 'Config deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default ConfigController;