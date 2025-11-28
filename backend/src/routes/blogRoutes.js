const express = require('express');
const BlogController = require('../controllers/blogController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, blogSchemas, commonSchemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         excerpt:
 *           type: string
 *         content:
 *           type: string
 *         image:
 *           type: string
 *         category:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [draft, published]
 *         readTime:
 *           type: string
 *         views:
 *           type: integer
 *         publishDate:
 *           type: string
 *           format: date-time
 *         authorId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [title, views, publish_date]
 *           default: publish_date
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 */
router.get('/',
  optionalAuth,
  validate(blogSchemas.query, 'query'),
  BlogController.getAll
);

/**
 * @swagger
 * /api/v1/blog/categories:
 *   get:
 *     summary: Get blog categories
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', BlogController.getCategories);

/**
 * @swagger
 * /api/v1/blog/tags:
 *   get:
 *     summary: Get blog tags
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */
router.get('/tags', BlogController.getTags);

/**
 * @swagger
 * /api/v1/blog/slug/{slug}:
 *   get:
 *     summary: Get blog post by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 */
router.get('/slug/:slug',
  optionalAuth,
  BlogController.getBySlug
);

/**
 * @swagger
 * /api/v1/blog/{id}:
 *   get:
 *     summary: Get blog post by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 */
router.get('/:id',
  optionalAuth,
  validate({ id: commonSchemas.id }, 'params'),
  BlogController.getById
);

/**
 * @swagger
 * /api/v1/blog:
 *   post:
 *     summary: Create new blog post (admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               publishDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/',
  authenticate,
  authorize('admin', 'super_admin'),
  validate(blogSchemas.create),
  BlogController.create
);

/**
 * @swagger
 * /api/v1/blog/{id}:
 *   put:
 *     summary: Update blog post (admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               publishDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Blog post not found
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  validate(blogSchemas.update),
  BlogController.update
);

/**
 * @swagger
 * /api/v1/blog/{id}:
 *   delete:
 *     summary: Delete blog post (admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Blog post not found
 */
router.delete('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  BlogController.delete
);

/**
 * @swagger
 * /api/v1/blog/{id}/views:
 *   patch:
 *     summary: Increment blog post views
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Views incremented successfully
 *       404:
 *         description: Blog post not found
 */
router.patch('/:id/views',
  validate({ id: commonSchemas.id }, 'params'),
  BlogController.incrementViews
);

module.exports = router;
