// TODO: create following functions:
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  getCats,
  getCatsByBoundingBox,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import MessageResponse from '../../interfaces/MessageResponse';
import {Cat} from '../../interfaces/Cat';
import {Types} from 'mongoose';

const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response<Cat>, next: NextFunction) => {
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
    const id = req.params.id as unknown as Types.ObjectId;
    const cat = await getCat(id);
    if (cat) {
      res.json(cat);
      return;
    }
    next(new CustomError('Cat not found', 400));
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, Omit<Cat, 'owner'>>,
  res: Response<MessageResponse & {data: Partial<Cat>}>,
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

  // catPost should use req.file to get filename

  // catPost should use addCat function from catModel
  // catPost should use res.locals.coords to get lat and lng (see middlewares.ts)
  // catPost should use req.user to get user_id and role (see passport/index.ts and express.d.ts)
  try {
    const result = await addCat({
      ...req.body,
      location: res.locals.coords,
      filename: req.file?.filename || '',
      owner: {
        _id: req.user!._id,
        user_name: req.user!.user_name,
        email: req.user!.email,
      },
    });
    if (result) {
      res.json({message: 'Cat created', data: result});
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse & {data: Partial<Cat>}>,
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
    const id = req.params.id as unknown as Types.ObjectId;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {owner, ...cat} = req.body;
    const result = await updateCat(cat, id);

    result
      ? res.json({message: 'Cat updated', data: result})
      : new CustomError('Bad request', 400);
  } catch (error) {
    next(error);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse & {data: Partial<Cat>}>,
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
    const id = req.params.id as unknown as Types.ObjectId;
    const cat = req.body;
    const result = await updateCat({...cat, owner: req.user}, id);

    result
      ? res.json({message: 'Cat updated', data: result})
      : new CustomError('Bad request', 400);
  } catch (error) {
    next(error);
  }
};

// catDelete should use deleteCat function from catModel
// catDelete should use validationResult to validate req.params.id
const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse & {data: {_id: string}}>,
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
    if (!req.params.id || !req.user?._id) {
      next(new CustomError('Bad request, id missing', 400));
    }
    const result = await deleteCat(
      req.params.id as unknown as Types.ObjectId,
      req.user?._id as unknown as Types.ObjectId
    );
    result
      ? res.json({message: 'Cat deleted', data: {_id: req.params.id}})
      : new CustomError('No cat deleted', 400);
  } catch (error) {
    next(error);
  }
};

const catDeleteAdmin = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse & {data: {_id: string}}>,
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

  if (req.user!.role !== 'admin') {
    res.status(403).end();
  }

  try {
    if (!req.params.id) {
      next(new CustomError('Bad request, cat id missing', 400));
    }
    const result = await deleteCat(req.params.id as unknown as Types.ObjectId);
    result
      ? res.json({message: 'Cat deleted', data: {_id: req.params.id}})
      : next(new CustomError('No cat deleted', 400));
  } catch (error) {
    next(error);
  }
};

const catGetByUser = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    if (req.user) {
      const cats = await getCats(req.user._id as unknown as Types.ObjectId);
      res.json(cats);
      return;
    }
    next(new CustomError('No user', 400));
  } catch (error) {
    next(error);
  }
};

const catGetByBoundingBox = async (
  req: Request<{topRight: string; bottomLeft: string}>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await getCatsByBoundingBox(
      req.query.topRight as string,
      req.query.bottomLeft as string
    );
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

export {
  catListGet,
  catGet,
  catPost,
  catPut,
  catPutAdmin,
  catDelete,
  catDeleteAdmin,
  catGetByUser,
  catGetByBoundingBox,
};
