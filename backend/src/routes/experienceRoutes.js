const express = require('express');
const ExperienceController = require('../controllers/experienceController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, experienceSchemas, commonSchemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Experience:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         company:
 *           type: string
 *         location:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         current:
 *           type: boolean
 *         description:
 *           type: string
 *         achievements:
 *           type: array
 *           items:
 *             type: string
 *         technologies:
 *           type: array
 *           items:
 *             type: string
 *         type:
 *           type: string
 *           enum: [full-time, part-time, contract, freelance, internship]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/experience:
 *   get:
 *     summary: Get all experience entries
 *     tags: [Experience]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, freelance, internship]
 *       - in: query
 *         name: current
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [company, date]
 *           default: date
 *     responses:
 *       200:
 *         description: Experience entries retrieved successfully
 */
router.get('/',
  optionalAuth,
  validate(experienceSchemas.query, 'query'),
  ExperienceController.getAll
);

/**
 * @swagger
 * /api/v1/experience/current:
 *   get:
 *     summary: Get current position
 *     tags: [Experience]
 *     responses:
 *       200:
 *         description: Current position retrieved successfully
 */
router.get('/current', ExperienceController.getCurrent);

/**
 * @swagger
 * /api/v1/experience/timeline:
 *   get:
 *     summary: Get experience timeline
 *     tags: [Experience]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Experience timeline retrieved successfully
 */
router.get('/timeline', ExperienceController.getTimeline);

/**
 * @swagger
 * /api/v1/experience/companies:
 *   get:
 *     summary: Get list of companies
 *     tags: [Experience]
 *     responses:
 *       200:
 *         description: Companies list retrieved successfully
 */
router.get('/companies', ExperienceController.getCompanies);

/**
 * @swagger
 * /api/v1/experience/technologies:
 *   get:
 *     summary: Get list of technologies
 *     tags: [Experience]
 *     responses:
 *       200:
 *         description: Technologies list retrieved successfully
 */
router.get('/technologies', ExperienceController.getTechnologies);

/**
 * @swagger
 * /api/v1/experience/{id}:
 *   get:
 *     summary: Get experience entry by ID
 *     tags: [Experience]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Experience entry retrieved successfully
 *       404:
 *         description: Experience entry not found
 */
router.get('/:id',
  optionalAuth,
  validate({ id: commonSchemas.id }, 'params'),
  ExperienceController.getById
);

/**
 * @swagger
 * /api/v1/experience:
 *   post:
 *     summary: Create new experience entry (admin only)
 *     tags: [Experience]
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
 *               - company
 *               - startDate
 *               - technologies
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               current:
 *                 type: boolean
 *               description:
 *                 type: string
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, freelance, internship]
 *     responses:
 *       201:
 *         description: Experience entry created successfully
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
  validate(experienceSchemas.create),
  ExperienceController.create
);

/**
 * @swagger
 * /api/v1/experience/{id}:
 *   put:
 *     summary: Update experience entry (admin only)
 *     tags: [Experience]
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
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               current:
 *                 type: boolean
 *               description:
 *                 type: string
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, freelance, internship]
 *     responses:
 *       200:
 *         description: Experience entry updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Experience entry not found
 */
router.put('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  validate(experienceSchemas.update),
  ExperienceController.update
);

/**
 * @swagger
 * /api/v1/experience/{id}:
 *   delete:
 *     summary: Delete experience entry (admin only)
 *     tags: [Experience]
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
 *         description: Experience entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Experience entry not found
 */
router.delete('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  ExperienceController.delete
);

module.exports = router;
