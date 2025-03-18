import { Request } from 'express';

/**
 * Represents a whiteboard document, including the owner, title, content, and access type.
 */
export interface Whiteboard {
  _id?: string;
  owner: string;
  title: string;
  dateCreated: Date;
  content: string;
  uniqueLink: string;
  accessType: 'read-only' | 'editable';
}

export type WhiteboardResponse = Whiteboard | { error: string };

export interface AddWhiteBoardRequest extends Request {
  body: Omit<Whiteboard, '_id'>;
}
