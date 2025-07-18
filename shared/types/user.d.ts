import { Request } from 'express';
import { ObjectId } from 'mongodb';

/**
 * Represents user credentials for authentication.
 * - `username`: The unique username of the user.
 * - `password`: The user's password.
 */
export interface UserCredentials {
  username: string;
  password: string;
}

/**
 * Represents Google OAuth credentials for authentication.
 * - `googleId`: The unique Google ID of the user.
 * - `email`: The user's email from Google account.
 * - `name`: The user's name from Google account.
 * - `picture`: URL to the user's Google profile picture.
 */
export interface GoogleCredentials {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

/**
 * Represents a user document, including user credentials and additional details.
 * - `username`: The unique username of the user.
 * - `password`: The user's password (optional if using OAuth).
 * - `dateJoined`: The date when the user registered.
 * - `biography`: A short description or bio of the user (optional).
 * - `googleId`: The user's Google ID (optional, for OAuth login).
 * - `email`: The user's email address (optional).
 * - `avatarUrl`: URL to the user's profile picture (optional).
 */
export interface User {
  username: string;
  password?: string;
  dateJoined: Date;
  biography?: string;
  googleId?: string;
  email?: string;
  avatarUrl?: string;
  socketId?: string;
}

/**
 * Represents a user document in the database.
 * - `username`: The unique username of the user.
 * - `password`: The user's password.
 * - `dateJoined`: The date when the user registered.
 * - `biography`: A short description or bio of the user (optional).
 * - `googleId`: The user's Google ID (optional, for OAuth login).
 * - `email`: The user's email address (optional).
 * - `avatarUrl`: URL to the user's profile picture (optional).
 * - `_id`: The unique identifier for the user, generated by MongoDB.
 */
export interface DatabaseUser extends User {
  _id: ObjectId;
}

/**
 * Express request for user login, containing user credentials.
 * - `username`: The username submitted in the request (body).
 * - `password`: The password submitted in the request (body).
 * - `biography`: Optional field for biography information (body).
 */
export interface UserRequest extends Request {
  body: {
    username: string;
    password: string;
    biography?: string;
  };
}

/**
 * Express request for Google OAuth login, containing Google credentials.
 * - `credential`: The Google JWT token credential.
 */
export interface GoogleOAuthRequest extends Request {
  body: {
    credential: string;
  };
}

/**
 * Express request for querying a user by their username.
 * - `username`: The username provided as a route parameter.
 */
export interface UserByUsernameRequest extends Request {
  params: {
    username: string;
  };
}

/**
 * Represents a "safe" user object that excludes sensitive information like the password.
 */
export type SafeDatabaseUser = Omit<DatabaseUser, 'password'>;

/**
 * Represents the response for user-related operations.
 * - `SafeDatabaseUser`: A user object without sensitive data if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type UserResponse = SafeDatabaseUser | { error: string };

/**
 * Represents the response for multiple user-related operations.
 * - `SafeDatabaseUser[]`: A list of user objects without sensitive data if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type UsersResponse = SafeDatabaseUser[] | { error: string };

/**
 * Express request for updating a user's biography.
 * - `username`: The username whose biography is being updated (body).
 * - `biography`: The new biography content to be set (body).
 */
export interface UpdateBiographyRequest extends Request {
  body: {
    username: string;
    biography: string;
  };
}

/**
 * Express request for updating a user's socket.
 *
 * - `username`: The username whose socket is being updated (body).
 * - `socketId`: The new socket ID to be set (body).
 */
export interface UpdateUserSocketRequest extends Request {
  body: {
    username: string;
    socketId: string | undefined;
  };
}
