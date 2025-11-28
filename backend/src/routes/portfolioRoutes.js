const express = require('express');
const PortfolioController = require('../controllers/portfolioController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, portfolioSchemas, commonSchemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Portfolio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         longDescription:
 *           type: string
 *         image:
 *           type: string
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *         liveUrl:
 *           type: string
 *         githubUrl:
 *           type: string
 *         featured:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [draft, published]
 *         sortOrder:
 *           type: integer
 *         views:
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
 * /api/v1/portfolio:
 *   get:
 *     summary: Get all portfolio items
 *     tags: [Portfolio]
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
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [title, views, created_at]
 *           default: created_at
 *     responses:
 *       200:
 *         description: Portfolio items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     portfolios:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Portfolio'
 *                     pagination:
 *                       type: object
 */
router.get('/',
  optionalAuth,
  validate(portfolioSchemas.query, 'query'),
  PortfolioController.getAll
);

/**
 * @swagger
 * /api/v1/portfolio/featured:
 *   get:
 *     summary: Get featured portfolio items
 *     tags: [Portfolio]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 6
 *     responses:
 *       200:
 *         description: Featured portfolio items retrieved successfully
 */
router.get('/featured', PortfolioController.getFeatured);

/**
 * @swagger
 * /api/v1/portfolio/categories:
 *   get:
 *     summary: Get portfolio categories
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/categories', PortfolioController.getCategories);

/**
 * @swagger
 * /api/v1/portfolio:
 *   post:
 *     summary: Create new portfolio item (admin only)
 *     tags: [Portfolio]
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
 *               - category
 *               - description
 *               - technologies
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               longDescription:
 *                 type: string
 *               image:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               liveUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Portfolio item created successfully
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
  validate(portfolioSchemas.create),
  PortfolioController.create
);

/**
 * @swagger
 * /api/v1/portfolio/slug/{slug}:
 *   get:
 *     summary: Get portfolio item by slug
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio item retrieved successfully
 *       404:
 *         description: Portfolio item not found
 */
router.get('/slug/:slug',
  optionalAuth,
  PortfolioController.getBySlug
);

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   get:
 *     summary: Get portfolio item by ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Portfolio item retrieved successfully
 *       404:
 *         description: Portfolio item not found
 */
router.get('/:id',
  optionalAuth,
  validate({ id: commonSchemas.id }, 'params'),
  PortfolioController.getById
);

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   put:
 *     summary: Update portfolio item (admin only)
 *     tags: [Portfolio]
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
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               longDescription:
 *                 type: string
 *               image:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               liveUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Portfolio item updated successfully
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Portfolio item not found
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  validate(portfolioSchemas.update),
  PortfolioController.update
);

/**
 * @swagger
 * /api/v1/portfolio/{id}/featured:
 *   patch:
 *     summary: Toggle featured status (admin only)
 *     tags: [Portfolio]
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
 *         description: Featured status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Portfolio item not found
 */
router.patch('/:id/featured',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  PortfolioController.toggleFeatured
);

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   delete:
 *     summary: Delete portfolio item (admin only)
 *     tags: [Portfolio]
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
 *         description: Portfolio item deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Portfolio item not found
 */
router.delete('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  PortfolioController.delete
);

module.exports = router;
