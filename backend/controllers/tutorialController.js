import Tutorial from '../models/Tutorial.js';

export const getTutorials = async (req, res) => {
  try {
    const includeInactive = String(req.query.includeInactive || '') === 'true';
    const query = includeInactive ? {} : { isActive: true };

    const tutorials = await Tutorial.find(query).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: tutorials.length,
      tutorials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createTutorial = async (req, res) => {
  try {
    const { title, youtubeUrl, description, order, isActive } = req.body;

    const tutorial = await Tutorial.create({
      title,
      youtubeUrl,
      description: typeof description === 'string' ? description : '',
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    res.status(201).json({
      success: true,
      tutorial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, youtubeUrl, description, order, isActive } = req.body;

    const update = {};
    if (typeof title === 'string') update.title = title;
    if (typeof youtubeUrl === 'string') update.youtubeUrl = youtubeUrl;
    if (typeof description === 'string') update.description = description;
    if (order !== undefined) update.order = Number.isFinite(Number(order)) ? Number(order) : 0;
    if (typeof isActive === 'boolean') update.isActive = isActive;

    const tutorial = await Tutorial.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial not found'
      });
    }

    res.status(200).json({
      success: true,
      tutorial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTutorial = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findByIdAndDelete(id);

    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: 'Tutorial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tutorial deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
