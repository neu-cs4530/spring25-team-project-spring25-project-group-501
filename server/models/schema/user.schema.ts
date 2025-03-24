import { User } from '@fake-stack-overflow/shared';
import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `biography`: A user's bio information (optional).
 * - `googleId`: The Google ID for OAuth authentication (optional).
 * - `email`: The email address of the user (optional).
 * - `avatarUrl`: URL to the user's profile picture (optional).
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
      required(this: User) {
        // Password is required only if there's no googleId
        return !this.googleId;
      },
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      sparse: true,
    },
    avatarUrl: {
      type: String,
    },
  },
  { collection: 'User' },
);

export default userSchema;
