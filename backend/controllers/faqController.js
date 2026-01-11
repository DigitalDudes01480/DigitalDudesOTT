import FAQ from '../models/FAQ.js';

export const getFaqs = async (req, res) => {
  try {
    const includeInactive = String(req.query.includeInactive || '') === 'true';
    const query = includeInactive ? {} : { isActive: true };

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;

    const faq = await FAQ.create({
      question,
      answer,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    res.status(201).json({
      success: true,
      faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isActive } = req.body;

    const update = {};
    if (typeof question === 'string') update.question = question;
    if (typeof answer === 'string') update.answer = answer;
    if (order !== undefined) update.order = Number.isFinite(Number(order)) ? Number(order) : 0;
    if (typeof isActive === 'boolean') update.isActive = isActive;

    const faq = await FAQ.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
