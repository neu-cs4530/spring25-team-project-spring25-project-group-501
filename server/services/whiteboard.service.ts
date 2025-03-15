import WhiteboardModel from '../models/whiteboard.model';
import { Whiteboard, WhiteboardResponse } from '../types/types';

/**
 * Saves a new whiteboard to the database.
 * @param whiteboard the whiteboard object to be saved
 * @returns the saved whiteboard object or an error message
 */
export const saveWhiteboard = async (whiteboard: Whiteboard): Promise<WhiteboardResponse> => {
  try {
    const result: Whiteboard = await WhiteboardModel.create(whiteboard);

    if (!result) {
      throw Error('Failed to create whiteboard');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when saving whiteboard: ${error}` };
  }
};

/**
 * Retrieves a whiteboard from the database by its unique link.
 * @param uniqueLink the unique link of the whiteboard to find
 * @returns the found whiteboard object or an error message
 */
export const getWhiteboardByLink = async (uniqueLink: string): Promise<WhiteboardResponse> => {
  try {
    const whiteboard: Whiteboard | null = await WhiteboardModel.findOne({ uniqueLink });

    if (!whiteboard) {
      throw Error('Whiteboard not found');
    }

    return whiteboard;
  } catch (error) {
    return { error: `Error occurred when finding whiteboard: ${error}` };
  }
};

/**
 * Retrieves all whiteboards from the database belownging to a specific owner.
 * @param owner the username of the owner of the whiteboards to find
 * @returns an array of whiteboard objects or an empty array
 */
export const getWhiteBoardsByOwner = async (owner: string): Promise<Whiteboard[]> => {
  try {
    const whiteboards: Whiteboard[] = await WhiteboardModel.find({ owner });

    if (!whiteboards) {
      throw Error('Whiteboards not found');
    }

    return whiteboards;
  } catch (error) {
    return [];
  }
};

/**
 * Updates a whiteboard in the database.
 * @param uniqueLink the unique link of the whiteboard to update
 * @param content the new content of the whiteboard
 * @returns the updated whiteboard object or an error message
 */
export const updateWhiteboard = async (
  uniqueLink: string,
  updates: Partial<Whiteboard>,
): Promise<WhiteboardResponse> => {
  try {
    const result: Whiteboard | null = await WhiteboardModel.findOneAndUpdate(
      { uniqueLink },
      { $set: updates },
      { new: true },
    );

    if (!result) {
      throw Error('Failed to update whiteboard');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when updating whiteboard: ${error}` };
  }
};

/**
 * Deletes a whiteboard from the database by its unique link.
 * @param uniqueLink the unique link of the whiteboard to delete
 * @returns the deleted whiteboard object or an error message
 */
export const deleteWhiteboardByLink = async (uniqueLink: string): Promise<WhiteboardResponse> => {
  try {
    const result: Whiteboard | null = await WhiteboardModel.findOneAndDelete({ uniqueLink });

    if (!result) {
      throw Error('Failed to delete whiteboard');
    }

    return result;
  } catch (error) {
    return { error: `Error occurred when deleting whiteboard: ${error}` };
  }
};
