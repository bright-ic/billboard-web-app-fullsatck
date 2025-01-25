
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from "bcrypt";
import { RoleEnum } from '../types/Types';

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    userGroup?: string;
    lastLogin: string;
  }
  
  const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        default: RoleEnum.Admin,
        enum: Object.values(RoleEnum),
        required: true,
    },
    lastLogin: {type: String, required: false}
  }, { timestamps: true, collection: "user" });
  

  UserSchema.methods.toJSON = function () {
    const data = { ...this._doc, id: this._doc._id?.toString() };

    delete data._id;
    delete data.__v;
    delete data.password;
    delete data.lastLogin;
  
    return data;
  };
  
  UserSchema.methods.comparePassword = function (val: string) {
    return bcrypt.compareSync(val, this.password);
  };


  const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

  export default UserModel;