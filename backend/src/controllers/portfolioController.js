const Portfolio = require('../models/Portfolio');
const logger = require('../config/logger');

class PortfolioController {
  // Get all portfolio items
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        featured,
        search,
        orderBy = 'created_at'
      } = req.query;

      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
      };

      // Only show published items for non-authenticated users
      if (!req.user) {
        options.status = 'published';
      } else if (status) {
        options.status = status;
      }

      if (category) options.category = category;
      if (featured !== undefined) options.featured = featured === 'true';
      if (search) options.search = search;

      const portfolios = await Portfolio.findAll(options);

      res.json({
        success: true,
        data: {
          portfolios,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: portfolios.length,
          },
        },
      });
    } catch (error) {
      logger.error('Get portfolios error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get portfolio items',
      });
    }
  }

  // Get single portfolio item
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const portfolio = await Portfolio.findById(id);

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      // Only show published items for non-authenticated users
      if (!req.user && portfolio.status !== 'published') {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      // Increment views for published items
      if (portfolio.status === 'published') {
        await portfolio.incrementViews();
      }

      res.json({
        success: true,
        data: { portfolio },
      });
    } catch (error) {
      logger.error('Get portfolio by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get portfolio item',
      });
    }
  }

  // Get portfolio by slug
  static async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const portfolio = await Portfolio.findBySlug(slug);

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      // Only show published items for non-authenticated users
      if (!req.user && portfolio.status !== 'published') {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      // Increment views for published items
      if (portfolio.status === 'published') {
        await portfolio.incrementViews();
      }

      res.json({
        success: true,
        data: { portfolio },
      });
    } catch (error) {
      logger.error('Get portfolio by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get portfolio item',
      });
    }
  }

  // Create new portfolio item (admin only)
  static async create(req, res) {
    try {
      const portfolioData = req.body;
      const portfolio = new Portfolio(portfolioData);

      // Check if slug already exists
      if (portfolio.slug) {
        const existingPortfolio = await Portfolio.findBySlug(portfolio.slug);
        if (existingPortfolio) {
          return res.status(400).json({
            success: false,
            message: 'Portfolio with this slug already exists',
          });
        }
      }

      await portfolio.save();

      logger.info(`Portfolio created: ${portfolio.title} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Portfolio item created successfully',
        data: { portfolio },
      });
    } catch (error) {
      logger.error('Create portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create portfolio item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Update portfolio item (admin only)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      // Check if slug is being changed and if it already exists
      if (updateData.slug && updateData.slug !== portfolio.slug) {
        const existingPortfolio = await Portfolio.findBySlug(updateData.slug);
        if (existingPortfolio) {
          return res.status(400).json({
            success: false,
            message: 'Portfolio with this slug already exists',
          });
        }
      }

      // Update portfolio fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          portfolio[key] = updateData[key];
        }
      });

      await portfolio.save();

      logger.info(`Portfolio updated: ${portfolio.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Portfolio item updated successfully',
        data: { portfolio },
      });
    } catch (error) {
      logger.error('Update portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update portfolio item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Delete portfolio item (admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      await portfolio.delete();

      logger.info(`Portfolio deleted: ${portfolio.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Portfolio item deleted successfully',
      });
    } catch (error) {
      logger.error('Delete portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete portfolio item',
      });
    }
  }

  // Get portfolio categories
  static async getCategories(req, res) {
    try {
      const categories = await Portfolio.getCategories();

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      logger.error('Get portfolio categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get portfolio categories',
      });
    }
  }

  // Get featured portfolio items
  static async getFeatured(req, res) {
    try {
      const { limit = 6 } = req.query;

      const options = {
        featured: true,
        status: 'published',
        limit: parseInt(limit),
        orderBy: 'views',
      };

      const portfolios = await Portfolio.findAll(options);

      res.json({
        success: true,
        data: { portfolios },
      });
    } catch (error) {
      logger.error('Get featured portfolios error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get featured portfolio items',
      });
    }
  }

  // Toggle featured status (admin only)
  static async toggleFeatured(req, res) {
    try {
      const { id } = req.params;

      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio item not found',
        });
      }

      portfolio.featured = !portfolio.featured;
      await portfolio.save();

      logger.info(`Portfolio featured toggled: ${portfolio.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: `Portfolio item ${portfolio.featured ? 'featured' : 'unfeatured'} successfully`,
        data: { portfolio },
      });
    } catch (error) {
      logger.error('Toggle portfolio featured error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle featured status',
      });
    }
  }
}

module.exports = PortfolioController;
