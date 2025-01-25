import mongoose, { Schema, Document, Model } from 'mongoose';

interface IBlog extends Document {
    title: string;
    category: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
    image: string;
    lastUpdatedBy: string;
  }
  
  const BlogSchema: Schema = new Schema({
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    image: { type: String },
  }, { timestamps: true, collection: "blog" });
  
  const BlogModel: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema);

  export default BlogModel;