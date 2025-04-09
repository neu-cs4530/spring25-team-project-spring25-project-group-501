import mongoose, { Model } from 'mongoose';
import whiteboardSchema from './schema/whiteboard.schema';
import { Whiteboard } from '../types/types';

/**
 * Mongoose model for the `Whiteboard` collection.
 *
 * This model is created using the `Whiteboard` interface and the `whiteboardSchema`, representing the
 * `Whiteboard` collection in the MongoDB database, and provides an interface for interacting with
 * the stored whiteboards.
 *
 * @type {Model<Whiteboard>}
 */
const WhiteboardModel: Model<Whiteboard> = mongoose.model<Whiteboard>(
  'Whiteboard',
  whiteboardSchema,
);

export default WhiteboardModel;
