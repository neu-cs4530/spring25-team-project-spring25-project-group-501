import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Chat collection.
 *
 * - `participants`: an array of ObjectIds referencing the User collection.
 * - `messages`: an array of ObjectIds referencing the Message collection.
 * - Timestamps store `createdAt` & `updatedAt`.
 */
const chatSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    permissions: [{ user: String, role: String }],
  },
  {
    collection: 'Chat',
    timestamps: true,
  },
);

export default chatSchema;
