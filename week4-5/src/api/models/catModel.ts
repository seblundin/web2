// mongoose schema for cat
// intface User is located in src/interfaces/Cat.ts

import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

const catModel = new mongoose.Schema<Cat>({
  cat_name: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  owner: {
    id: mongoose.Schema.Types.ObjectId,
    user_name: String,
    email: String,
  },
  filename: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

catModel.method('toJSON', function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {__v, _id, ...object} = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model<Cat>('Cat', catModel);
