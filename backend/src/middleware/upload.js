const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
const imageDir = path.join(uploadDir, 'images');
const documentDir = path.join(uploadDir, 'documents');

[uploadDir, imageDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  };

  const allAllowedTypes = [...allowedTypes.image, ...allowedTypes.document];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const destination = isImage ? imageDir : documentDir;
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files per request
  },
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        const originalPath = file.path;
        const filename = file.filename;
        const nameWithoutExt = path.parse(filename).name;
        
        // Create different sizes
        const sizes = {
          thumbnail: { width: 150, height: 150, suffix: '_thumb' },
          medium: { width: 500, height: 500, suffix: '_medium' },
          large: { width: 1200, height: 1200, suffix: '_large' }
        };

        const processedVersions = {
          original: `/uploads/images/${filename}`,
        };

        // Process different sizes
        for (const [sizeName, config] of Object.entries(sizes)) {
          const outputFilename = `${nameWithoutExt}${config.suffix}.webp`;
          const outputPath = path.join(imageDir, outputFilename);

          await sharp(originalPath)
            .resize(config.width, config.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

          processedVersions[sizeName] = `/uploads/images/${outputFilename}`;
        }

        // Convert original to WebP for better compression
        const webpFilename = `${nameWithoutExt}.webp`;
        const webpPath = path.join(imageDir, webpFilename);
        
        await sharp(originalPath)
          .webp({ quality: 90 })
          .toFile(webpPath);

        processedVersions.webp = `/uploads/images/${webpFilename}`;

        processedFiles.push({
          ...file,
          processedVersions,
          url: `/uploads/images/${filename}`,
          webpUrl: `/uploads/images/${webpFilename}`,
        });

        logger.info(`Image processed: ${filename}`);
      } else {
        // For non-image files, just add the URL
        const subdir = file.mimetype.startsWith('image/') ? 'images' : 'documents';
        processedFiles.push({
          ...file,
          url: `/uploads/${subdir}/${file.filename}`,
        });
      }
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    logger.error('Image processing error:', error);
    next(error);
  }
};

// File upload middleware with error handling
const handleUpload = (fieldName, maxCount = 1) => {
  return (req, res, next) => {
    const uploadMiddleware = maxCount === 1 
      ? upload.single(fieldName)
      : upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${maxCount}.`,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Unexpected field name. Expected: ${fieldName}`,
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload error.',
          error: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

// Delete file utility
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
  }
};

// Delete processed image versions
const deleteProcessedImages = async (originalFilename) => {
  try {
    const nameWithoutExt = path.parse(originalFilename).name;
    const suffixes = ['_thumb', '_medium', '_large', ''];
    const extensions = ['.webp'];

    for (const suffix of suffixes) {
      for (const ext of extensions) {
        const filename = `${nameWithoutExt}${suffix}${ext}`;
        const filePath = path.join(imageDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    logger.info(`Processed images deleted for: ${originalFilename}`);
  } catch (error) {
    logger.error(`Error deleting processed images for ${originalFilename}:`, error);
  }
};

// Validate file type
const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        });
      }
    }
    
    next();
  };
};

// Get file info
const getFileInfo = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const stats = fs.statSync(fullPath);
    const extension = path.extname(filePath).toLowerCase();
    
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension,
      isImage: ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension),
      isDocument: ['.pdf', '.doc', '.docx', '.txt'].includes(extension),
    };
  } catch (error) {
    logger.error(`Error getting file info for ${filePath}:`, error);
    return null;
  }
};

module.exports = {
  handleUpload,
  processImage,
  deleteFile,
  deleteProcessedImages,
  validateFileType,
  getFileInfo,
  uploadDir,
  imageDir,
  documentDir,
};
