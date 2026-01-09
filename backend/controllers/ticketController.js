import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// Create new ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;

    // Handle image attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Image file size should be less than 5MB'
          });
        }
        attachments.push({
          data: file.buffer.toString('base64'),
          contentType: file.mimetype,
          filename: file.originalname
        });
      }
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      category,
      priority,
      messages: [{
        sender: req.user._id,
        senderRole: 'customer',
        message,
        attachments
      }]
    });

    await ticket.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get my tickets (for customers)
export const getMyTickets = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all tickets (for admin)
export const getAllTickets = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .populate('messages.sender', 'name role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .populate('messages.sender', 'name role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user is authorized to view this ticket
    if (req.user.role === 'customer' && ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add message to ticket
export const addMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Handle image attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Image file size should be less than 5MB'
          });
        }
        attachments.push({
          data: file.buffer.toString('base64'),
          contentType: file.mimetype,
          filename: file.originalname
        });
      }
    }

    ticket.messages.push({
      sender: req.user._id,
      senderRole: req.user.role === 'admin' ? 'admin' : 'customer',
      message,
      attachments
    });

    // If admin replies, set status to in-progress if it's open
    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'name role');

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update ticket status (admin only)
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (status) {
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (status === 'closed') {
        ticket.closedAt = new Date();
      }
    }

    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();
    await ticket.populate('user', 'name email');
    await ticket.populate('assignedTo', 'name');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete ticket (admin only)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
