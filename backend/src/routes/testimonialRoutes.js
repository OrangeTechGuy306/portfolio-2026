const express = require('express');
const TestimonialController = require('../controllers/testimonialController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, testimonialSchemas, commonSchemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonial:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         position:
 *           type: string
 *         company:
 *           type: string
 *         content:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         avatar:
 *           type: string
 *         featured:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         projectType:
 *           type: string
 *         sortOrder:
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
 * /api/v1/testimonials:
 *   get:
 *     summary: Get all testimonials
 *     tags: [Testimonials]
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
 *           enum: [pending, approved, rejected]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectType
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
 *           enum: [rating, name, company, sort_order]
 *           default: sort_order
 *     responses:
 *       200:
 *         description: Testimonials retrieved successfully
 */
router.get('/',
  optionalAuth,
  validate(testimonialSchemas.query, 'query'),
  TestimonialController.getAll
);

/**
 * @swagger
 * /api/v1/testimonials/stats:
 *   get:
 *     summary: Get testimonial statistics (admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats',
  authenticate,
  authorize('admin', 'super_admin'),
  TestimonialController.getStats
);

/**
 * @swagger
 * /api/v1/testimonials/companies:
 *   get:
 *     summary: Get list of companies
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: Companies list retrieved successfully
 */
router.get('/companies', TestimonialController.getCompanies);

/**
 * @swagger
 * /api/v1/testimonials/project-types:
 *   get:
 *     summary: Get list of project types
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: Project types list retrieved successfully
 */
router.get('/project-types', TestimonialController.getProjectTypes);

/**
 * @swagger
 * /api/v1/testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Testimonial retrieved successfully
 *       404:
 *         description: Testimonial not found
 */
router.get('/:id',
  optionalAuth,
  validate({ id: commonSchemas.id }, 'params'),
  TestimonialController.getById
);

/**
 * @swagger
 * /api/v1/testimonials:
 *   post:
 *     summary: Create new testimonial (admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               company:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               avatar:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               projectType:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/',
  authenticate,
  authorize('admin', 'super_admin'),
  validate(testimonialSchemas.create),
  TestimonialController.create
);

/**
 * @swagger
 * /api/v1/testimonials/{id}:
 *   put:
 *     summary: Update testimonial (admin only)
 *     tags: [Testimonials]
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
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               company:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               avatar:
 *                 type: string
 *               featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               projectType:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Testimonial not found
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  validate(testimonialSchemas.update),
  TestimonialController.update
);

/**
 * @swagger
 * /api/v1/testimonials/{id}/featured:
 *   patch:
 *     summary: Toggle featured status (admin only)
 *     tags: [Testimonials]
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
 *         description: Testimonial not found
 */
router.patch('/:id/featured',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  TestimonialController.toggleFeatured
);

/**
 * @swagger
 * /api/v1/testimonials/{id}/approve:
 *   patch:
 *     summary: Approve testimonial (admin only)
 *     tags: [Testimonials]
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
 *         description: Testimonial approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Testimonial not found
 */
router.patch('/:id/approve',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  TestimonialController.approve
);

/**
 * @swagger
 * /api/v1/testimonials/{id}/reject:
 *   patch:
 *     summary: Reject testimonial (admin only)
 *     tags: [Testimonials]
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
 *         description: Testimonial rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Testimonial not found
 */
router.patch('/:id/reject',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  TestimonialController.reject
);

/**
 * @swagger
 * /api/v1/testimonials/{id}:
 *   delete:
 *     summary: Delete testimonial (admin only)
 *     tags: [Testimonials]
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
 *         description: Testimonial deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Testimonial not found
 */
router.delete('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  TestimonialController.delete
);

module.exports = router;
