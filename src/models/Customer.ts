
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    accessCode: string;
    lastLogin: string;
  }
  
  const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    accessCode: { type: String, required: false },
    lastLogin: {type: String, required: false}
  }, { timestamps: true, collection: "customer" });
  

  UserSchema.methods.toJSON = function () {
    const data = { ...this._doc, id: this._doc._id?.toString() };

    delete data._id;
    delete data.__v;
    delete data.accessCode;
    delete data.lastLogin;
  
    return data;
  };
  
  const UserModel: Model<IUser> = mongoose.model<IUser>('Customer', UserSchema);

  export default UserModel;