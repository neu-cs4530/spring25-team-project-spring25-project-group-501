import { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mongoose schema for the Whiteboard collection.
 *
 * This schema defines the structure for storing whiteboards in the database.
 *
 * Each Whiteboard includes the following fields:
 * - `owner`: The username of the user who created the whiteboard.
 * - `title`: The title of the whiteboard.
 * - `dateCreated`: The date the whiteboard was created.
 * - `content`: The content of the whiteboard.
 * - `uniqueLink`: The unique link to access the whiteboard.
 * - `accessType`: The access type of the whiteboard (read-only or editable).
 */
const whiteboardSchema: Schema = new Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    content: { type: Object, default: {} },
    uniqueLink: { type: String, required: true, unique: true, default: uuidv4 },
    accessType: {
      type: String,
      enum: ['read-only', 'editable'],
      required: true,
      default: 'editable',
    },
  },
  { collection: 'Whiteboard', timestamps: true },
);

export default whiteboardSchema;
