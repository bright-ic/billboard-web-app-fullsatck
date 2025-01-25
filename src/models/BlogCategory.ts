import mongoose, { Schema, Document, Model } from 'mongoose';

interface ICategory extends Document {
    name: string;
    description: string;
    createdBy: string;
    updatedBy: string;
  }
  
  const CategorySchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    updatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }, { timestamps: true, collection: "blog-category" });
  
  const BlogCategory: Model<ICategory> = mongoose.model<ICategory>('BlogCategory', CategorySchema);

  export default BlogCategory;