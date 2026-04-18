'use strict';

const Order   = require('../orders/order.model');
const Product = require('../products/product.model');
const User    = require('../users/user.model');

// ── Shared pipeline stages to join items with product costPrice ───────────
const ITEM_PROFIT_PIPELINE = [
  { $match: { status: { $nin: ['cancelled'] } } },
  { $unwind: '$items' },
  {
    $lookup: {
      from: 'products',
      localField: 'items.product',
      foreignField: '_id',
      as: 'prod',
    },
  },
  {
    $addFields: {
      itemRevenue: { $multiply: ['$items.price', '$items.quantity'] },
      itemCost: {
        $multiply: [
          { $ifNull: [{ $arrayElemAt: ['$prod.costPrice', 0] }, 0] },
          '$items.quantity',
        ],
      },
    },
  },
];

const monthLabel = {
  $concat: [
    { $toString: '$_id.year' },
    '-',
    {
      $cond: [
        { $lt: ['$_id.month', 10] },
        { $concat: ['0', { $toString: '$_id.month' }] },
        { $toString: '$_id.month' },
      ],
    },
  ],
};

const getDashboard = async () => {
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    // Total counts
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'customer' }),

    // Recent 10 orders
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    // Count by status
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),
  ]);

  // Profit aggregations run separately so a pipeline error doesn't break the whole dashboard
  let profitAgg = [];
  let revenueByMonth = [];
  try {
    [profitAgg, revenueByMonth] = await Promise.all([
      // Total revenue + cost (delivered orders, per item × costPrice)
      Order.aggregate([
        ...ITEM_PROFIT_PIPELINE,
        {
          $group: {
            _id: null,
            revenue: { $sum: '$itemRevenue' },
            cost:    { $sum: '$itemCost' },
          },
        },
      ]),

      // Revenue + cost by month (last 6 months, sorted newest first)
      Order.aggregate([
        ...ITEM_PROFIT_PIPELINE,
        {
          $group: {
            _id: {
              year:  { $year:  '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$itemRevenue' },
            cost:    { $sum: '$itemCost' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
        { $sort: { '_id.year':  1, '_id.month':  1 } },
        {
          $project: {
            _id: 0,
            month:   monthLabel,
            revenue: 1,
            cost:    1,
            profit:  { $subtract: ['$revenue', '$cost'] },
          },
        },
      ]),
    ]);
  } catch (err) {
    console.error('[admin.service] Profit aggregation error:', err.message);
  }

  const totalRevenue = profitAgg[0]?.revenue ?? 0;
  const totalCost    = profitAgg[0]?.cost    ?? 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus,
    revenueByMonth,
  };
};

module.exports = { getDashboard };
