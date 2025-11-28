const Testimonial = require('../models/Testimonial');
const logger = require('../config/logger');

class TestimonialController {
  // Get all testimonials
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        featured,
        rating,
        company,
        projectType,
        search,
        orderBy = 'sort_order'
      } = req.query;

      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
      };

      if (status) options.status = status;
      if (featured !== undefined) options.featured = featured === 'true';
      if (rating) options.rating = rating;
      if (company) options.company = company;
      if (projectType) options.projectType = projectType;
      if (search) options.search = search;

      const testimonials = await Testimonial.findAll(options);

      res.json({
        success: true,
        data: {
          testimonials,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: testimonials.length,
          },
        },
      });
    } catch (error) {
      logger.error('Get testimonials error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get testimonials',
      });
    }
  }

  // Get single testimonial
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const testimonial = await Testimonial.findById(id);

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found',
        });
      }

      res.json({
        success: true,
        data: { testimonial },
      });
    } catch (error) {
      logger.error('Get testimonial by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get testimonial',
      });
    }
  }

  // Create new testimonial (admin only)
  static async create(req, res) {
    try {
      const testimonialData = req.body;
      
      const testimonial = new Testimonial(testimonialData);
      await testimonial.save();

      logger.info(`Testimonial created: ${testimonial.name} from ${testimonial.company} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Testimonial created successfully',
        data: { testimonial },
      });
    } catch (error) {
      logger.error('Create testimonial error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Update testimonial (admin only)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found',
        });
      }

      // Update testimonial fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          testimonial[key] = updateData[key];
        }
      });

      await testimonial.save();

      logger.info(`Testimonial updated: ${testimonial.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Testimonial updated successfully',
        data: { testimonial },
      });
    } catch (error) {
      logger.error('Update testimonial error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Delete testimonial (admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found',
        });
      }

      await testimonial.delete();

      logger.info(`Testimonial deleted: ${testimonial.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Testimonial deleted successfully',
      });
    } catch (error) {
      logger.error('Delete testimonial error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete testimonial',
      });
    }
  }

  // Toggle featured status (admin only)
  static async toggleFeatured(req, res) {
    try {
      const { id } = req.params;

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found',
        });
      }

      await testimonial.toggleFeatured();

      logger.info(`Testimonial featured toggled: ${testimonial.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Featured status toggled successfully',
        data: { testimonial },
      });
    } catch (error) {
      logger.error('Toggle featured error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle featured status',
      });
    }
  }

  // Approve testimonial (admin only)
  static async approve(req, res) {
    try {
      const { id } = req.params;

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found',
        });
      }

      await testimonial.approve();

      logger.info(`Testimonial approved: ${testimonial.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Testimonial approved successfully',
        data: { testimonial },
      });
    } catch (error) {
      logger.error('Approve testimonial error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve testimonial',
      });
    }
  }

  // Reject testimonial (admin only)
  static async reject(req, res) {
    try {
      const { id } = req.params;

      const testimonial = await Testimonial.findById(id);
      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: 'Testimonial not found',
        });
      }

      await testimonial.reject();

      logger.info(`Testimonial rejected: ${testimonial.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Testimonial rejected successfully',
        data: { testimonial },
      });
    } catch (error) {
      logger.error('Reject testimonial error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject testimonial',
      });
    }
  }

  // Get testimonial statistics (admin only)
  static async getStats(req, res) {
    try {
      const stats = await Testimonial.getStats();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get testimonial stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get testimonial statistics',
      });
    }
  }

  // Get companies
  static async getCompanies(req, res) {
    try {
      const companies = await Testimonial.getCompanies();

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

  // Get project types
  static async getProjectTypes(req, res) {
    try {
      const projectTypes = await Testimonial.getProjectTypes();

      res.json({
        success: true,
        data: { projectTypes },
      });
    } catch (error) {
      logger.error('Get project types error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get project types',
      });
    }
  }
}

module.exports = TestimonialController;
