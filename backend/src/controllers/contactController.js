const Contact = require('../models/Contact');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');

class ContactController {
  // Create email transporter
  static createTransporter() {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Submit contact form (public)
  static async create(req, res) {
    try {
      const { name, email, subject, message } = req.body;
      const { ipAddress, userAgent } = req.clientInfo;

      // Create contact message
      const contact = new Contact({
        name,
        email,
        subject,
        message,
        ipAddress,
        userAgent,
        status: 'unread',
      });

      await contact.save();

      // Send notification email to admin (optional)
      try {
        const transporter = ContactController.createTransporter();
        
        const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>IP Address: ${ipAddress}</small></p>
            <p><small>User Agent: ${userAgent}</small></p>
            <p><small>Submitted: ${new Date().toLocaleString()}</small></p>
          `,
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Contact form notification sent for: ${email}`);
      } catch (emailError) {
        logger.error('Failed to send contact form notification:', emailError);
        // Don't fail the request if email sending fails
      }

      logger.info(`Contact form submitted: ${email} - ${subject}`);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully! We\'ll get back to you soon.',
        data: { contact: contact.toJSON ? contact.toJSON() : contact },
      });
    } catch (error) {
      logger.error('Contact form submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // Get all contact messages (admin only)
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        replied,
        email,
        search,
        dateFrom,
        dateTo,
        orderBy = 'created_at'
      } = req.query;

      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        orderBy,
      };

      if (status) options.status = status;
      if (replied !== undefined) options.replied = replied === 'true';
      if (email) options.email = email;
      if (search) options.search = search;
      if (dateFrom) options.dateFrom = dateFrom;
      if (dateTo) options.dateTo = dateTo;

      const contacts = await Contact.findAll(options);

      res.json({
        success: true,
        data: {
          contacts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: contacts.length,
          },
        },
      });
    } catch (error) {
      logger.error('Get contact messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contact messages',
      });
    }
  }

  // Get single contact message (admin only)
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      // Mark as read if it's unread
      if (contact.status === 'unread') {
        await contact.markAsRead();
      }

      res.json({
        success: true,
        data: { contact },
      });
    } catch (error) {
      logger.error('Get contact message by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contact message',
      });
    }
  }

  // Reply to contact message (admin only)
  static async reply(req, res) {
    try {
      const { id } = req.params;
      const { replyMessage } = req.body;

      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      // Send reply email
      try {
        const transporter = ContactController.createTransporter();
        
        const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: contact.email,
          subject: `Re: ${contact.subject}`,
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Dear ${contact.name},</p>
            <p>${replyMessage.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><strong>Your original message:</strong></p>
            <p><em>"${contact.message}"</em></p>
            <p>Best regards,<br>${process.env.FROM_NAME || 'Portfolio Team'}</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        
        // Mark as replied
        await contact.markAsReplied(replyMessage);

        logger.info(`Reply sent to: ${contact.email} by ${req.user.email}`);

        res.json({
          success: true,
          message: 'Reply sent successfully',
          data: { contact },
        });
      } catch (emailError) {
        logger.error('Failed to send reply email:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send reply email',
        });
      }
    } catch (error) {
      logger.error('Reply to contact message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reply to contact message',
      });
    }
  }

  // Update contact message status (admin only)
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      contact.status = status;
      await contact.save();

      logger.info(`Contact message status updated: ${id} to ${status} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: { contact },
      });
    } catch (error) {
      logger.error('Update contact status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status',
      });
    }
  }

  // Archive contact message (admin only)
  static async archive(req, res) {
    try {
      const { id } = req.params;

      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      await contact.archive();

      logger.info(`Contact message archived: ${id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Contact message archived successfully',
      });
    } catch (error) {
      logger.error('Archive contact message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive contact message',
      });
    }
  }

  // Delete contact message (admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact message not found',
        });
      }

      await contact.delete();

      logger.info(`Contact message deleted: ${id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Contact message deleted successfully',
      });
    } catch (error) {
      logger.error('Delete contact message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete contact message',
      });
    }
  }

  // Get contact statistics (admin only)
  static async getStats(req, res) {
    try {
      const stats = await Contact.getStats();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get contact stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contact statistics',
      });
    }
  }
}

module.exports = ContactController;
