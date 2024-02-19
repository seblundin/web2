// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query
import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../models/userModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt, {hash} from 'bcryptjs';
import {User, UserOutput} from '../../interfaces/User';
import MessageResponse from '../../interfaces/MessageResponse';
import {validationResult} from 'express-validator';
import {Types} from 'mongoose';
const salt = bcrypt.genSaltSync(12);

const userListGet = async (
  _req: Request,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = await getUser(req.params.id as unknown as Types.ObjectId);
    user ? res.json(user) : new CustomError('Not found', 404);
  } catch (error) {
    next(error);
  }
};

// TDOD: create userPost function to add new user
// userPost should use addUser function from userModel
// userPost should use validationResult to validate req.body
// - user_name should be at least 3 characters long
// - email should be a valid email
// - password should be at least 5 characters long
// userPost should use bcrypt to hash password
const userPost = async (
  req: Request<Omit<User, 'user_id'>>,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  // catPost should use validationResult to validate req.body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    if (req.body.password.length < 5) {
      next(new CustomError('Invalid password length', 400));
    }
    const password = await hash(req.body.password, salt);

    const user = await addUser({...req.body, password});
    user
      ? res.json({message: 'User added', data: user})
      : next(new CustomError('Bad request', 400));
    return;
  } catch (error) {
    next(error);
  }
};

const userPut = async (
  req: Request<{id: Types.ObjectId}>,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    if (req.user && req.user.role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const user = req.body;

    const result = await updateUser(user, req.params.id);
    result
      ? res.json({message: 'User updated', data: result})
      : new CustomError('Error', 500);
  } catch (error) {
    next(error);
  }
};

// userPutCurrent should use updateUser function from userModel
// userPutCurrent should use validationResult to validate req.body
const userPutCurrent = async (
  req: Request,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  if (!req.user) {
    next(new CustomError('User data missing', 500));
  }

  try {
    const result = await updateUser(req.body, req.user!._id);
    result
      ? res.json({message: 'User updated', data: result})
      : new CustomError('User not found', 404);
  } catch (error) {
    next(error);
  }
};

// userDelete should use deleteUser function from userModel
// userDelete should use validationResult to validate req.params.id
// userDelete should use req.user to get role
const userDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }

  try {
    if (!req.params.id) {
      next(new CustomError('Bad request, user id missing', 400));
    }
    const result = await deleteUser(req.params.id as unknown as Types.ObjectId);
    result
      ? res.json({message: 'User deleted'})
      : new CustomError('Not found', 404);
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  const user = req.user;

  try {
    if (!user) {
      throw new CustomError('No user', 400);
    }
    const result = await deleteUser(user._id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, role, ...other} = user;
    result
      ? res.json({
          message: 'User deleted',
          data: other,
        })
      : next(new CustomError('Not found', 404));
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    res.json({
      _id: req.user._id,
      email: req.user.email,
      user_name: req.user.user_name,
    });
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  userDeleteCurrent,
  checkToken,
};
