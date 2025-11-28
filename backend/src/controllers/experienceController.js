const Experience = require('../models/Experience');
const logger = require('../config/logger');

class ExperienceController {
  // Get all experience entries
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        current,
        company,
        orderBy = 'date'
      } = req.query;

      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
      };

      if (type) options.type = type;
      if (current !== undefined) options.current = current === 'true';
      if (company) options.company = company;

      const experiences = await Experience.findAll(options);

      res.json({
        success: true,
        data: {
          experiences,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: experiences.length,
          },
        },
      });
    } catch (error) {
      logger.error('Get experiences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get experience entries',
      });
    }
  }

  // Get single experience entry
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const experience = await Experience.findById(id);

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience entry not found',
        });
      }

      res.json({
        success: true,
        data: { experience },
      });
    } catch (error) {
      logger.error('Get experience by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get experience entry',
      });
    }
  }

  // Create new experience entry (admin only)
  static async create(req, res) {
    try {
      const experienceData = req.body;
      
      // If current is true, set endDate to null
      if (experienceData.current) {
        experienceData.endDate = null;
      }

      const experience = new Experience(experienceData);
      await experience.save();

      logger.info(`Experience created: ${experience.title} at ${experience.company} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Experience entry created successfully',
        data: { experience },
      });
    } catch (error) {
      logger.error('Create experience error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create experience entry',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Update experience entry (admin only)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const experience = await Experience.findById(id);
      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience entry not found',
        });
      }

      // If current is true, set endDate to null
      if (updateData.current) {
        updateData.endDate = null;
      }

      // Update experience fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          experience[key] = updateData[key];
        }
      });

      await experience.save();

      logger.info(`Experience updated: ${experience.title} at ${experience.company} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Experience entry updated successfully',
        data: { experience },
      });
    } catch (error) {
      logger.error('Update experience error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update experience entry',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Delete experience entry (admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const experience = await Experience.findById(id);
      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience entry not found',
        });
      }

      await experience.delete();

      logger.info(`Experience deleted: ${experience.title} at ${experience.company} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Experience entry deleted successfully',
      });
    } catch (error) {
      logger.error('Delete experience error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete experience entry',
      });
    }
  }

  // Get companies
  static async getCompanies(req, res) {
    try {
      const companies = await Experience.getCompanies();

      res.json({
        success: true,
        data: { companies },
      });
    } catch (error) {
      logger.error('Get companies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get companies',
      });
    }
  }

  // Get technologies
  static async getTechnologies(req, res) {
    try {
      const technologies = await Experience.getTechnologies();

      res.json({
        success: true,
        data: { technologies },
      });
    } catch (error) {
      logger.error('Get technologies error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get technologies',
      });
    }
  }

  // Get current position
  static async getCurrent(req, res) {
    try {
      const experiences = await Experience.findAll({ current: true, limit: 1 });

      res.json({
        success: true,
        data: { 
          experience: experiences.length > 0 ? experiences[0] : null 
        },
      });
    } catch (error) {
      logger.error('Get current experience error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get current experience',
      });
    }
  }

  // Get experience timeline (public)
  static async getTimeline(req, res) {
    try {
      const { limit = 10 } = req.query;

      const experiences = await Experience.findAll({
        limit: parseInt(limit),
        orderBy: 'date',
      });

      // Add period information to each experience
      const timeline = experiences.map(exp => ({
        ...exp,
        period: exp.getPeriod(),
      }));

      res.json({
        success: true,
        data: { timeline },
      });
    } catch (error) {
      logger.error('Get experience timeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get experience timeline',
      });
    }
  }
}

module.exports = ExperienceController;
