import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * Represents a message in a chat.
 * - `msg`: The text content of the message.
 * - `msgFrom`: The username of the user sending the message.
 * - `msgDateTime`: The date and time when the message was sent.
 * - `type`: The type of the message, either 'global' or 'direct'.
 * - `poll`: Optional poll object if the message is a poll.
 */
export interface Message {
  msg: string;
  msgFrom: string;
  msgDateTime: Date;
  type: 'global' | 'direct' | 'poll';
  poll?: {
    question: string;
    options: { optionText: string }[];
    votes: Map<string, number>;
  };
}

/**
 * Represents a message stored in the database.
 * - `_id`: Unique identifier for the message.
 * - `msg`: The text content of the message.
 * - `msgFrom`: The username of the user sending the message.
 * - `msgDateTime`: The date and time when the message was sent.
 * - `type`: The type of the message, either 'global' or 'direct'.
 * - `poll`: Optional poll object if the message is a poll.
 */
export interface DatabaseMessage extends Message {
  _id: ObjectId;
}

/**
 * Type representing possible responses for a Message-related operation.
 * - Either a `DatabaseMessage` object or an error message.
 */
export type MessageResponse = DatabaseMessage | { error: string };

/**
 * Express request for adding a message to a chat.
 * - `body`: Contains the `messageToAdd` object, which includes the message text and metadata (excluding `type`).
 */
export interface AddMessageRequest extends Request {
  body: {
    messageToAdd: Omit<Message, 'type'>;
  };
}

export interface VoteOnPollRequest extends Request {
  body: {
    chatID: string;
    messageID: string;
    optionIndex: number;
    username: string;
  };
}
