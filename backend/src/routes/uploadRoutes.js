const express = require('express');
const UploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleUpload, processImage, validateFileType } = require('../middleware/upload');

const router = express.Router();

// Allowed file types
const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const documentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const allTypes = [...imageTypes, ...documentTypes];

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         originalName:
 *           type: string
 *         filename:
 *           type: string
 *         mimetype:
 *           type: string
 *         size:
 *           type: integer
 *         url:
 *           type: string
 *         webpUrl:
 *           type: string
 *         processedVersions:
 *           type: object
 *           properties:
 *             original:
 *               type: string
 *             thumbnail:
 *               type: string
 *             medium:
 *               type: string
 *             large:
 *               type: string
 *             webp:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/upload/single:
 *   post:
 *     summary: Upload single file (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 5MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                     file:
 *                       $ref: '#/components/schemas/FileUpload'
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/single',
  authenticate,
  authorize('admin', 'super_admin'),
  handleUpload('file', 1),
  validateFileType(allTypes),
  processImage,
  UploadController.uploadSingle
);

/**
 * @swagger
 * /api/v1/upload/multiple:
 *   post:
 *     summary: Upload multiple files (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 5 files, 5MB each)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
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
 *                     files:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUpload'
 *                     count:
 *                       type: integer
 *       400:
 *         description: No files uploaded or invalid file types
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/multiple',
  authenticate,
  authorize('admin', 'super_admin'),
  handleUpload('files', 5),
  validateFileType(allTypes),
  processImage,
  UploadController.uploadMultiple
);

/**
 * @swagger
 * /api/v1/upload/avatar:
 *   post:
 *     summary: Upload avatar image (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No avatar uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/avatar',
  authenticate,
  authorize('admin', 'super_admin'),
  handleUpload('avatar', 1),
  validateFileType(imageTypes),
  processImage,
  UploadController.uploadAvatar
);

/**
 * @swagger
 * /api/v1/upload/portfolio-image:
 *   post:
 *     summary: Upload portfolio image (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Portfolio image file (max 5MB)
 *     responses:
 *       200:
 *         description: Portfolio image uploaded successfully
 *       400:
 *         description: No image uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/portfolio-image',
  authenticate,
  authorize('admin', 'super_admin'),
  handleUpload('image', 1),
  validateFileType(imageTypes),
  processImage,
  UploadController.uploadPortfolioImage
);

/**
 * @swagger
 * /api/v1/upload/stats:
 *   get:
 *     summary: Get upload statistics (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload statistics retrieved successfully
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
 *                         images:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             totalSize:
 *                               type: integer
 *                             totalSizeMB:
 *                               type: number
 *                         documents:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             totalSize:
 *                               type: integer
 *                             totalSizeMB:
 *                               type: number
 *                         total:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             totalSize:
 *                               type: integer
 *                             totalSizeMB:
 *                               type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats',
  authenticate,
  authorize('admin', 'super_admin'),
  UploadController.getUploadStats
);

/**
 * @swagger
 * /api/v1/upload/{filename}:
 *   get:
 *     summary: Get file information
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [images, documents]
 *           default: images
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *       404:
 *         description: File not found
 */
router.get('/:filename',
  UploadController.getFileInfo
);

/**
 * @swagger
 * /api/v1/upload/{filename}:
 *   delete:
 *     summary: Delete file (admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [images, documents]
 *           default: images
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: File not found
 */
router.delete('/:filename',
  authenticate,
  authorize('admin', 'super_admin'),
  UploadController.deleteFile
);

module.exports = router;
