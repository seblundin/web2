// TODO: cat interface
import {Document, Types} from 'mongoose';

interface Cat extends Document {
  _id: Types.ObjectId;
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: string;
  location: Coordinates;
  owner: Owner;
}

interface Owner {
  _id: Types.ObjectId;
  user_name: string;
  email: string;
}

interface Coordinates {
  type: string;
  coordinates: [number, number];
}

export {Cat};
