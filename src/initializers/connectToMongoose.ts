import mongoose, { Mongoose } from 'mongoose';

export const connectToMongoose = (url: string): Promise<Mongoose> => {
  return mongoose.connect(url);
};
