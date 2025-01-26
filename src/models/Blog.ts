import mongoose, { Schema, Document, Model } from 'mongoose';
import { BlogStatusEnum } from '../types/Types';
import slugify from "slugify";

export interface IBlog extends Document {
    title: string;
    slug: string;
    category: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
    thumbnail: string;
    updatedBy: string;
    status: BlogStatusEnum.ACTIVE | BlogStatusEnum.INACTIVE
}
  
  const BlogSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    thumbnail: { type: String },
    status: { type: String, enum: Object.values(BlogStatusEnum) }
  }, { timestamps: true, collection: "blog" });

  BlogSchema.pre('save', async function (next) {
    if (this.isModified('title')) {
      const title: any = this.title;
      let slug = slugify(title, { lower: true, strict: true });
      let count = 1;
  
      // Check if the slug already exists
      while (true) {
        const existingBlog = await mongoose.model('Blog').findOne({ slug });
        if (!existingBlog) break; // Slug is unique, exit the loop
        slug = `${slug}-${count}`; // Append a number to make it unique
        count++;
      }
  
      this.slug = slug; // Assign the unique slug
    }
    next();
  });
  
  const BlogModel: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema);

  export default BlogModel;