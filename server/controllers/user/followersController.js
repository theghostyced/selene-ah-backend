import models from '../../models';
import pagination from '../../helpers/pagination/pagination';
import Notification from '../notification/NotificationController';

const { Follower, User } = models;
/**
 * @description - Followers Controller
 */
class FollowerController {
  /**
   * @description - This function follows an Author
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @returns {object} - Response to be sent
   */
  static async followAuthor(req, res, next) {
    try {
      const { followerId } = req.body;
      const userId = req.user.id;
      const { user } = req;
      const follow = await Follower.create({
        userId,
        followerId
      });
      await Notification.emitFollowNotifcation(user, userId, followerId, next);
      return res.status(200).json({
        success: true,
        message: 'Follow successful',
        data: follow
      });
    } catch(err) {
      return next(err);
    }
  }

  /**
   * @description - This function unfollows an Author
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @returns {object} - Response to be sent
   */
  static async unfollowUser(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await Follower.destroy({
        where: {userId, followerId: id}
      });
      return res.status(200).json({
          success: true,
          message: 'You\'ve unfollow this User'
        });
    } catch(err) {
      return next(err);
    }
  }

  /**
   * @description - This function get all user followeess using the id supplied
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @param {string} id - ID
   * @returns {object} - get user
   */
  static async getFollowees(req, res, next, id) {
    const { limit, offset }= pagination.paginationHelper(req.query);
    try {
      const userId = id;
      const followees = await Follower.findAll({
        where: {userId},
        limit,
        offset,
        include: [{
          model: User,
          attributes: ['id', 'userName', 'email',
            'imageUrl', 'createdAt', 'updatedAt', 'bio'],
        }],
      });
      return followees.length >= 1 ? res.status(200).json({
        success: true,
        message: 'Followees returned successfully',
        followees
      }):res.status(200).json({
        success: true,
        message: 'No followees found'
      });
    } catch(err) {
      return next(err);
    }
  }

   /**
   * @description - This function get user followers using the id supplied
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @param {string} id - ID
   * @returns {object} - get user
   */
  static async getFollowers(req, res, next, id) {
    const { limit, offset }= pagination.paginationHelper(req.query);
    try {
      const followers = await Follower.findAndCountAll({
        where: {followerId: id},
        limit,
        offset,
        include: [{
          model: User,
          attributes: ['id', 'userName', 'email',
          'imageUrl', 'createdAt', 'updatedAt', 'bio'],
        }],
      });
      return followers.count > 0 ? res.status(200).json({
        success: true,
        message: 'Followers returned successfully',
        followers
      }):res.status(200).json({
        success: true,
        message: 'No followers found',
        followers
      });
    } catch(err) {
      return next(err);
    }
  }
  /**
   * @description - This function get an authenticated user
   * followers using the userId
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @returns {object} - Response to be sent
   */
  static getAllFollowers(req, res, next) {
    const userId = req.user.id;
    return FollowerController.getFollowers(req, res, next, userId);
  }

  /**
   * @description - This function get an authenticated user
   * followee using the userId
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @returns {object} - Response to be sent
   */
  static async getAllFollowees(req, res, next) {
    const id = req.user.id;
    return FollowerController.getFollowees(req, res, next, id);
  }

   /**
   * @description - This function get other user followees using the user's ID
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @returns {object} - Response to be sent
   */
  static async getAnotherUserFollowees(req, res, next) {
    const id = req.params.id;
    return FollowerController.getFollowees(req, res, next, id);
  }
  /**
   * @description - This function get other user followers
   * @param {object} req - request to be sent
   * @param {object} res - response gotten from server
   * @param {object} next - callback function
   * @returns {object} - Response to be sent
   */
  static async getUserFollowers(req, res, next){
    const { id } = req.params;
    return FollowerController.getFollowers(req, res, next, id);
  }
}

export default FollowerController;
