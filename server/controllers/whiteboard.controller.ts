import express, { Request, Response, Router } from 'express';
import { AddWhiteBoardRequest, Pixel, FakeSOSocket } from '../types/types';
import {
  saveWhiteboard,
  getWhiteboardByLink,
  getWhiteBoardsByOwner,
  deleteWhiteboardByLink,
  updateWhiteboard,
} from '../services/whiteboard.service';

const whiteboardController = (socket: FakeSOSocket): Router => {
  const router: Router = express.Router();

  const isRequestValid = (req: AddWhiteBoardRequest): boolean =>
    !!req.body.owner &&
    !!req.body.title &&
    !!req.body.content &&
    !!req.body.uniqueLink &&
    !!req.body.accessType;

  // Function to handle adding a new whiteboard
  const addWhiteboard = async (req: AddWhiteBoardRequest, res: Response) => {
    if (!isRequestValid(req)) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    try {
      const whiteboard = await saveWhiteboard(req.body);
      if ('error' in whiteboard) {
        throw new Error(whiteboard.error);
      }
      res.status(201).json(whiteboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create whiteboard' });
    }
  };

  // Function to handle getting a whiteboard by its unique link
  const getWhiteboard = async (req: Request, res: Response) => {
    const { uniqueLink } = req.params;
    try {
      const whiteboard = await getWhiteboardByLink(uniqueLink);
      if ('error' in whiteboard) {
        throw new Error(whiteboard.error);
      }
      res.status(200).json(whiteboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve whiteboard' });
    }
  };

  // Function to handle getting all whiteboards owned by a user
  const getWhiteboardsByOwnerHandler = async (req: Request, res: Response) => {
    const { owner } = req.params;
    try {
      const whiteboards = await getWhiteBoardsByOwner(owner);
      res.json(whiteboards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve whiteboards' });
    }
  };

  // Function to handle deleting a whiteboard by its unique link
  const deleteWhiteboard = async (req: Request, res: Response) => {
    const { uniqueLink } = req.params;
    try {
      const deleted = await deleteWhiteboardByLink(uniqueLink);
      if ('error' in deleted) {
        throw new Error(deleted.error);
      }
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete whiteboard' });
    }
  };

  // Add the functions to the router
  router.post('/addWhiteboard', addWhiteboard);
  router.get('/:uniqueLink', getWhiteboard);
  router.get('/byOwner/:owner', getWhiteboardsByOwnerHandler);
  router.delete('/:uniqueLink', deleteWhiteboard);

  socket.on('connection', conn => {
    // When a client wants to join a whiteboard room
    conn.on('joinWhiteboard', async (whiteboardLink: string) => {
      conn.join(whiteboardLink);
      try {
        const whiteboard = await getWhiteboardByLink(whiteboardLink);
        if ('error' in whiteboard) {
          throw new Error(whiteboard.error);
        }
        conn.emit('whiteboardContent', whiteboard.content);
      } catch (error) {
        conn.emit('whiteboardError', 'Failed to join whiteboard');
      }
    });

    // When a client wants to leave a whiteboard room
    conn.on('leaveWhiteboard', (whiteboardLink: string) => {
      conn.leave(whiteboardLink);
    });

    // Listen for whiteboard updates and broadcast them to others in the room
    conn.on('updateWhiteboard', async (whiteboardLink: string, content: Pixel[][]) => {
      try {
        const whiteboard = await getWhiteboardByLink(whiteboardLink);
        if ('error' in whiteboard) {
          throw new Error(whiteboard.error);
        }
        // Broadcast update to all clients in the room, except sender
        conn.to(whiteboardLink).emit('whiteboardContent', content);
        // Update whiteboard content and save changes
        await updateWhiteboard(whiteboardLink, { content: content });
      } catch (error) {
        conn.emit('whiteboardError', 'Failed to update whiteboard');
      }
    });
  });

  return router;
};

export default whiteboardController;
