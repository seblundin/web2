// TODO: mongoose schema for user
import mongoose, {Model, Schema, Types} from 'mongoose';
import {User, UserOutput} from '../../interfaces/User';
interface IUserModel extends Model<User> {
  removeSensitiveData(user: User): UserOutput;
}

const userSchema: Schema<User, IUserModel> = new Schema(
  {
    _id: {type: Schema.Types.ObjectId, auto: true},
    user_name: String,
    email: {type: String, unique: true},
    password: {type: String, require},
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    statics: {
      removeSensitiveData(user: User) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password, role, ...data} = user;
        return data;
      },
    },
  }
);

const UserModel = mongoose.model<User, IUserModel>('User', userSchema);

export const addUser = async (data: User) => {
  const newUser: User = await UserModel.create({...data});
  const returnData = await newUser.save();
  return UserModel.removeSensitiveData(returnData);
};

export const deleteUser = async (id: Types.ObjectId) => {
  const result = await UserModel.findByIdAndDelete(id);
  return result !== null;
};

export const getAllUsers = async () => {
  const results = await UserModel.find();
  if (results.length > 0) {
    return results.map((res) => UserModel.removeSensitiveData(res.toObject()));
  }
  return [];
};

export const getUser = async (id: Types.ObjectId) => {
  const result = await UserModel.findById(id);
  if (result) {
    return UserModel.removeSensitiveData(result.toObject());
  }
  return null;
};

export const updateUser = async (data: UserOutput, id: Types.ObjectId) => {
  // eslint-disable-next-line prettier/prettier
  const result = await UserModel.findByIdAndUpdate(id, data, {
    // the default value is before?????!???!?
    returnDocument: 'after',
  });
  if (result) {
    return UserModel.removeSensitiveData(result.toObject());
  }
  return null;
};

export {UserModel};
