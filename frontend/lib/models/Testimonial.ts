import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  position?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  projectType?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [255, 'Name cannot exceed 255 characters'],
    },
    position: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    avatar: {
      type: String,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    projectType: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TestimonialSchema.index({ status: 1 });
TestimonialSchema.index({ featured: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ sortOrder: 1 });
TestimonialSchema.index({ company: 1 });

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;

