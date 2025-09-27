const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

// @desc    Get user's recommendation history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get recommendations with pagination
    const recommendations = await Recommendation.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-aiResponse'); // Exclude large aiResponse field for list view

    // Get total count for pagination
    const total = await Recommendation.countDocuments({ userId });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        recommendations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendation history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get detailed recommendation by ID
// @route   GET /api/history/:id
// @access  Private
const getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recommendation = await Recommendation.findOne({
      _id: id,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: {
        recommendation
      }
    });

  } catch (error) {
    console.error('Get history by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendation details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete recommendation from history
// @route   DELETE /api/history/:id
// @access  Private
const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recommendation = await Recommendation.findOneAndDelete({
      _id: id,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      message: 'Recommendation deleted successfully'
    });

  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting recommendation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/history/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic stats
    const totalRecommendations = await Recommendation.countDocuments({ userId });
    
    // Get recommendations by month for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await Recommendation.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get most recommended crops
    const cropStats = await Recommendation.aggregate([
      { $match: { userId } },
      { $unwind: '$recommendations.crops' },
      {
        $group: {
          _id: '$recommendations.crops.name',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$recommendations.crops.confidence' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get soil type distribution
    const soilStats = await Recommendation.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$soilType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalRecommendations,
        monthlyStats,
        cropStats,
        soilStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Export user's recommendation history
// @route   GET /api/history/export
// @access  Private
const exportHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || 'json'; // json or csv

    const recommendations = await Recommendation.find({ userId })
      .sort({ createdAt: -1 })
      .select('-aiResponse');

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Location,Soil Type,Area (acres),Irrigation Frequency,Crops,Status\n';
      const csvData = recommendations.map(rec => {
        const crops = rec.recommendations.crops?.map(c => c.name).join('; ') || 'N/A';
        return [
          rec.createdAt.toISOString().split('T')[0],
          rec.location.address,
          rec.soilType,
          rec.area,
          rec.irrigationFrequency,
          crops,
          rec.status
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="recommendation_history.csv"');
      res.send(csvHeader + csvData);
    } else {
      // Return JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="recommendation_history.json"');
      res.json({
        success: true,
        data: {
          recommendations,
          exportedAt: new Date().toISOString(),
          totalCount: recommendations.length
        }
      });
    }

  } catch (error) {
    console.error('Export history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting recommendation history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getHistory,
  getHistoryById,
  deleteHistoryItem,
  getUserStats,
  exportHistory
};

