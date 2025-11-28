const logger = require('../config/logger');
const { deleteFile, deleteProcessedImages, getFileInfo } = require('../middleware/upload');

class UploadController {
  // Upload single file
  static async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const file = req.processedFiles ? req.processedFiles[0] : req.file;
      const subdir = file.mimetype.startsWith('image/') ? 'images' : 'documents';
      
      const response = {
        success: true,
        message: 'File uploaded successfully',
        data: {
          file: {
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${subdir}/${file.filename}`,
          },
        },
      };

      // Add processed versions for images
      if (file.processedVersions) {
        response.data.file.processedVersions = file.processedVersions;
        response.data.file.webpUrl = file.webpUrl;
      }

      logger.info(`File uploaded: ${file.originalname} by ${req.user?.email || 'anonymous'}`);

      res.json(response);
    } catch (error) {
      logger.error('Upload single file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Upload multiple files
  static async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const files = req.processedFiles || req.files;
      const uploadedFiles = files.map(file => {
        const subdir = file.mimetype.startsWith('image/') ? 'images' : 'documents';
        
        const fileData = {
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${subdir}/${file.filename}`,
        };

        // Add processed versions for images
        if (file.processedVersions) {
          fileData.processedVersions = file.processedVersions;
          fileData.webpUrl = file.webpUrl;
        }

        return fileData;
      });

      logger.info(`${files.length} files uploaded by ${req.user?.email || 'anonymous'}`);

      res.json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        data: {
          files: uploadedFiles,
          count: uploadedFiles.length,
        },
      });
    } catch (error) {
      logger.error('Upload multiple files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Delete file
  static async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const { type = 'images' } = req.query; // images or documents

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename is required',
        });
      }

      // Validate type
      if (!['images', 'documents'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Must be "images" or "documents"',
        });
      }

      const filePath = `/uploads/${type}/${filename}`;
      
      // Check if file exists
      const fileInfo = getFileInfo(filePath);
      if (!fileInfo || !fileInfo.exists) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Delete the main file
      await deleteFile(filePath);

      // If it's an image, also delete processed versions
      if (type === 'images') {
        await deleteProcessedImages(filename);
      }

      logger.info(`File deleted: ${filename} by ${req.user?.email || 'anonymous'}`);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Get file info
  static async getFileInfo(req, res) {
    try {
      const { filename } = req.params;
      const { type = 'images' } = req.query;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename is required',
        });
      }

      if (!['images', 'documents'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Must be "images" or "documents"',
        });
      }

      const filePath = `/uploads/${type}/${filename}`;
      const fileInfo = getFileInfo(filePath);

      if (!fileInfo || !fileInfo.exists) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      res.json({
        success: true,
        data: {
          filename,
          url: filePath,
          ...fileInfo,
        },
      });
    } catch (error) {
      logger.error('Get file info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file info',
      });
    }
  }

  // Upload avatar (profile picture)
  static async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No avatar file uploaded',
        });
      }

      const file = req.processedFiles ? req.processedFiles[0] : req.file;
      
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Avatar must be an image file',
        });
      }

      const avatarData = {
        originalName: file.originalname,
        filename: file.filename,
        url: `/uploads/images/${file.filename}`,
        webpUrl: file.webpUrl,
        processedVersions: file.processedVersions,
      };

      logger.info(`Avatar uploaded: ${file.originalname} by ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatar: avatarData },
      });
    } catch (error) {
      logger.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Upload portfolio image
  static async uploadPortfolioImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No portfolio image uploaded',
        });
      }

      const file = req.processedFiles ? req.processedFiles[0] : req.file;
      
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Portfolio image must be an image file',
        });
      }

      const imageData = {
        originalName: file.originalname,
        filename: file.filename,
        url: `/uploads/images/${file.filename}`,
        webpUrl: file.webpUrl,
        processedVersions: file.processedVersions,
      };

      logger.info(`Portfolio image uploaded: ${file.originalname} by ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Portfolio image uploaded successfully',
        data: { image: imageData },
      });
    } catch (error) {
      logger.error('Upload portfolio image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload portfolio image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Get upload statistics (admin only)
  static async getUploadStats(req, res) {
    try {
      const fs = require('fs');
      const path = require('path');
      const { imageDir, documentDir } = require('../middleware/upload');

      const getDirectoryStats = (dirPath) => {
        try {
          const files = fs.readdirSync(dirPath);
          let totalSize = 0;
          let count = 0;

          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
              count++;
            }
          });

          return { count, totalSize };
        } catch (error) {
          return { count: 0, totalSize: 0 };
        }
      };

      const imageStats = getDirectoryStats(imageDir);
      const documentStats = getDirectoryStats(documentDir);

      const stats = {
        images: {
          count: imageStats.count,
          totalSize: imageStats.totalSize,
          totalSizeMB: Math.round(imageStats.totalSize / (1024 * 1024) * 100) / 100,
        },
        documents: {
          count: documentStats.count,
          totalSize: documentStats.totalSize,
          totalSizeMB: Math.round(documentStats.totalSize / (1024 * 1024) * 100) / 100,
        },
        total: {
          count: imageStats.count + documentStats.count,
          totalSize: imageStats.totalSize + documentStats.totalSize,
          totalSizeMB: Math.round((imageStats.totalSize + documentStats.totalSize) / (1024 * 1024) * 100) / 100,
        },
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get upload stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get upload statistics',
      });
    }
  }
}

module.exports = UploadController;
