const Blog = require('../models/Blog');
const logger = require('../config/logger');

class BlogController {
  // Get all blog posts
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        tag,
        search,
        orderBy = 'publish_date'
      } = req.query;

      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
      };

      if (status) options.status = status;
      if (category) options.category = category;
      if (tag) options.tag = tag;
      if (search) options.search = search;

      const blogs = await Blog.findAll(options);

      res.json({
        success: true,
        data: {
          blogs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: blogs.length,
          },
        },
      });
    } catch (error) {
      logger.error('Get blogs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blog posts',
      });
    }
  }

  // Get single blog post by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      res.json({
        success: true,
        data: { blog },
      });
    } catch (error) {
      logger.error('Get blog by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blog post',
      });
    }
  }

  // Get blog post by slug
  static async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const blog = await Blog.findBySlug(slug);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      // Increment views for public access
      if (!req.user) {
        await blog.incrementViews();
      }

      res.json({
        success: true,
        data: { blog },
      });
    } catch (error) {
      logger.error('Get blog by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blog post',
      });
    }
  }

  // Create new blog post (admin only)
  static async create(req, res) {
    try {
      const blogData = req.body;
      
      // Set author to current user
      blogData.authorId = req.user.id;

      // If status is published and no publish date, set to now
      if (blogData.status === 'published' && !blogData.publishDate) {
        blogData.publishDate = new Date();
      }

      const blog = new Blog(blogData);
      await blog.save();

      logger.info(`Blog post created: ${blog.title} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: { blog },
      });
    } catch (error) {
      logger.error('Create blog error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Blog post with this slug already exists',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Update blog post (admin only)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      // If changing to published and no publish date, set to now
      if (updateData.status === 'published' && !blog.publishDate && !updateData.publishDate) {
        updateData.publishDate = new Date();
      }

      // Update blog fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          blog[key] = updateData[key];
        }
      });

      await blog.save();

      logger.info(`Blog post updated: ${blog.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Blog post updated successfully',
        data: { blog },
      });
    } catch (error) {
      logger.error('Update blog error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Blog post with this slug already exists',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update blog post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Delete blog post (admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      await blog.delete();

      logger.info(`Blog post deleted: ${blog.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Blog post deleted successfully',
      });
    } catch (error) {
      logger.error('Delete blog error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog post',
      });
    }
  }

  // Get categories
  static async getCategories(req, res) {
    try {
      const categories = await Blog.getCategories();

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categories',
      });
    }
  }

  // Get tags
  static async getTags(req, res) {
    try {
      const tags = await Blog.getTags();

      res.json({
        success: true,
        data: { tags },
      });
    } catch (error) {
      logger.error('Get tags error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tags',
      });
    }
  }

  // Increment views
  static async incrementViews(req, res) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found',
        });
      }

      await blog.incrementViews();

      res.json({
        success: true,
        message: 'Views incremented successfully',
        data: { views: blog.views },
      });
    } catch (error) {
      logger.error('Increment views error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to increment views',
      });
    }
  }
}

module.exports = BlogController;
