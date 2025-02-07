
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    accessCode?: string;
    lastLogin?: string;
  }
  
  const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, default: "" },
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
  
  const UserModel: Model<ICustomer> = mongoose.model<ICustomer>('Customer', UserSchema);

  export default UserModel;