import mongoose, {Schema, Types} from 'mongoose';
import {Cat} from '../../interfaces/Cat';

const catSchema: Schema<Cat> = new Schema(
  {
    _id: {$type: Types.ObjectId, auto: true},
    cat_name: String,
    weight: Number,
    filename: String,
    birthdate: String,
    location: {
      type: String,
      coordinates: [Number, Number],
    },
    owner: {
      _id: Types.ObjectId,
      user_name: String,
      email: String,
    },
  },
  // replace default type keyword because of key name type in location object....
  {typeKey: '$type'}
);

const CatModel = mongoose.model<Cat>('Cat', catSchema);

export const addCat = async (data: Partial<Cat>) => {
  const cat = await CatModel.create(data);
  return await cat.save();
};

export const deleteCat = async (
  id: Types.ObjectId,
  ownerId?: Types.ObjectId
) => {
  const query = ownerId ? {_id: id, 'owner._id': ownerId} : {_id: id};
  const result = await CatModel.findOneAndDelete(query);
  return result !== null;
};

export const getAllCats = async () => {
  return await CatModel.find();
};

export const getCat = async (id: Types.ObjectId) => {
  return await CatModel.findById(id);
};

export const getCats = async (id: Types.ObjectId) => {
  const cats = await CatModel.find({'owner._id': id});
  return cats.map((cat) => cat.toObject());
};

export const updateCat = async (data: Partial<Cat>, id: Types.ObjectId) => {
  return await CatModel.findByIdAndUpdate(id, data, {returnDocument: 'after'});
};

export const getCatsByBoundingBox = async (
  topRight: string,
  bottomLeft: string
) => {
  const [lon1, lat1] = bottomLeft.split(',');
  const [lon2, lat2] = topRight.split(',');
  const cats = await CatModel.find({
    'location.coordinates.0': {$gte: lat1, $lte: lat2},
    'location.coordinates.1': {$gte: lon1, $lte: lon2},
  });
  return cats.map((cat) => cat.toObject());
};

export default CatModel;
