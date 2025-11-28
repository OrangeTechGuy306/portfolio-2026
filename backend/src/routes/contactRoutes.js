const express = require('express');
const ContactController = require('../controllers/contactController');
const { authenticate, authorize, extractClientInfo } = require('../middleware/auth');
const { contactRateLimit } = require('../middleware/security');
const { validate, contactSchemas, commonSchemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [unread, read, replied, archived]
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         replied:
 *           type: boolean
 *         replyMessage:
 *           type: string
 *         repliedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *               message:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     contact:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many contact form submissions
 *       500:
 *         description: Server error
 */
router.post('/',
  contactRateLimit,
  extractClientInfo,
  validate(contactSchemas.create),
  ContactController.create
);

/**
 * @swagger
 * /api/v1/contact:
 *   get:
 *     summary: Get all contact messages (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
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
 *           enum: [unread, read, replied, archived]
 *       - in: query
 *         name: replied
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [name, email, status, created_at]
 *           default: created_at
 *     responses:
 *       200:
 *         description: Contact messages retrieved successfully
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
 *                     contacts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/',
  authenticate,
  authorize('admin', 'super_admin'),
  ContactController.getAll
);

/**
 * @swagger
 * /api/v1/contact/stats:
 *   get:
 *     summary: Get contact statistics (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact statistics retrieved successfully
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         unread:
 *                           type: integer
 *                         read:
 *                           type: integer
 *                         replied:
 *                           type: integer
 *                         archived:
 *                           type: integer
 *                         today:
 *                           type: integer
 *                         this_week:
 *                           type: integer
 *                         this_month:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats',
  authenticate,
  authorize('admin', 'super_admin'),
  ContactController.getStats
);

/**
 * @swagger
 * /api/v1/contact/{id}:
 *   get:
 *     summary: Get contact message by ID (admin only)
 *     tags: [Contact]
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
 *         description: Contact message retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Contact message not found
 */
router.get('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  ContactController.getById
);

/**
 * @swagger
 * /api/v1/contact/{id}/reply:
 *   post:
 *     summary: Reply to contact message (admin only)
 *     tags: [Contact]
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
 *             required:
 *               - replyMessage
 *             properties:
 *               replyMessage:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Reply sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Contact message not found
 *       500:
 *         description: Failed to send reply email
 */
router.post('/:id/reply',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  validate(contactSchemas.reply),
  ContactController.reply
);

/**
 * @swagger
 * /api/v1/contact/{id}/status:
 *   patch:
 *     summary: Update contact message status (admin only)
 *     tags: [Contact]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [unread, read, replied, archived]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Contact message not found
 */
router.patch('/:id/status',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  ContactController.updateStatus
);

/**
 * @swagger
 * /api/v1/contact/{id}/archive:
 *   patch:
 *     summary: Archive contact message (admin only)
 *     tags: [Contact]
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
 *         description: Contact message archived successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Contact message not found
 */
router.patch('/:id/archive',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  ContactController.archive
);

/**
 * @swagger
 * /api/v1/contact/{id}:
 *   delete:
 *     summary: Delete contact message (admin only)
 *     tags: [Contact]
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
 *         description: Contact message deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Contact message not found
 */
router.delete('/:id',
  authenticate,
  authorize('admin', 'super_admin'),
  validate({ id: commonSchemas.id }, 'params'),
  ContactController.delete
);

module.exports = router;
