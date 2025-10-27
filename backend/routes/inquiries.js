const express = require('express');
const nodemailer = require('nodemailer');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create inquiry
router.post('/', async (req, res) => {
  try {
    const inquiry = new Inquiry(req.body);
    await inquiry.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const property = await Property.findById(req.body.propertyId);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Property Inquiry',
      text: `New inquiry for property: ${property.title}\nName: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get inquiries (admin only)
router.get('/', authenticateToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  try {
    const inquiries = await Inquiry.find().populate('propertyId').populate('userId');
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
