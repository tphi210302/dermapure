'use strict';

const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return ApiResponse.created(res, user, 'User created');
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', role = '' } = req.query;
  const result = await userService.getAllUsers({ page, limit, search, role });
  return ApiResponse.paginated(res, result);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return ApiResponse.ok(res, user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, { actorId: req.user.id });
  return ApiResponse.ok(res, user, 'User updated');
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, { actorId: req.user.id });
  return ApiResponse.ok(res, null, 'User deleted');
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  return ApiResponse.ok(res, user, 'Profile updated');
});

const getMyAffiliate = asyncHandler(async (req, res) => {
  const stats = await userService.getMyAffiliateStats(req.user.id);
  return ApiResponse.ok(res, stats);
});

const getAffiliateLeaderboard = asyncHandler(async (req, res) => {
  const rows = await userService.getAffiliateLeaderboard();
  return ApiResponse.ok(res, rows);
});

module.exports = {
  createUser, getAllUsers, getUserById, updateUser, deleteUser,
  updateProfile, getMyAffiliate, getAffiliateLeaderboard,
};
