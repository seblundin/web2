import {Document, Types} from 'mongoose';
interface User extends Document {
  _id: Types.ObjectId;
  user_name: string; // This is not username, just firstname lastname
  email: string; // Should be unique
  role: 'user' | 'admin'; // "user" or "admin"
  password: string;
}
interface UserTest {
  user_name: string;
  email: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserOutput {
  _id: Types.ObjectId;
  user_name: string; // This is not username, just firstname lastname
  email: string; // Should be unique
}

export {User, UserTest, UserOutput};
