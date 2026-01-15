import Account from '../models/Account.js';

const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

export const createAccount = async (req, res) => {
  try {
    const { platform, email, password, startDate, expiryDate } = req.body;

    if (!platform || !email || !password || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'platform, email, password, startDate, expiryDate are required'
      });
    }

    const parsedStartDate = normalizeDate(startDate);
    const parsedExpiryDate = normalizeDate(expiryDate);

    if (!parsedStartDate || !parsedExpiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate or expiryDate'
      });
    }

    const account = await Account.create({
      platform,
      email,
      password,
      startDate: parsedStartDate,
      expiryDate: parsedExpiryDate,
      createdBy: req.user?._id,
      updatedBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const { platform, expiringInDays } = req.query;

    let query = {};

    if (platform) {
      query.platform = platform;
    }

    if (expiringInDays !== undefined) {
      const days = Number(expiringInDays);
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() + (Number.isFinite(days) ? days : 0));

      query.expiryDate = { $gte: now, $lte: end };
    }

    const accounts = await Account.find(query)
      .sort({ expiryDate: 1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.status(200).json({
      success: true,
      account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const { platform, email, password, startDate, expiryDate } = req.body;

    if (platform !== undefined) account.platform = platform;
    if (email !== undefined) account.email = email;
    if (password !== undefined) account.password = password;

    if (startDate !== undefined) {
      const parsedStartDate = normalizeDate(startDate);
      if (!parsedStartDate) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate'
        });
      }
      account.startDate = parsedStartDate;
    }

    if (expiryDate !== undefined) {
      const parsedExpiryDate = normalizeDate(expiryDate);
      if (!parsedExpiryDate) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiryDate'
        });
      }
      account.expiryDate = parsedExpiryDate;
    }

    account.updatedBy = req.user?._id;

    await account.save();

    res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    await Account.deleteOne({ _id: account._id });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const renewAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const { startDate, expiryDate } = req.body;

    const parsedStartDate = normalizeDate(startDate);
    const parsedExpiryDate = normalizeDate(expiryDate);

    if (!parsedStartDate || !parsedExpiryDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and expiryDate are required and must be valid'
      });
    }

    account.startDate = parsedStartDate;
    account.expiryDate = parsedExpiryDate;
    account.updatedBy = req.user?._id;

    await account.save();

    res.status(200).json({
      success: true,
      message: 'Account renewed successfully',
      account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpiringSoon = async (req, res) => {
  try {
    const days = Number(req.query.days ?? 7);
    const safeDays = Number.isFinite(days) ? days : 7;

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + safeDays);

    const accounts = await Account.find({
      expiryDate: { $gte: now, $lte: end }
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
