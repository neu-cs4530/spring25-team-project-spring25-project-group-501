import axios from 'axios';
import { UserCredentials, SafeDatabaseUser, Whiteboard } from '../types/types';
import api from './config';

const WHITEBOARD_API_URL = `${process.env.REACT_APP_SERVER_URL}/whiteboard`;

const addWhiteboard = async (
  owner: string,
  title: string,
  dateCreated: Date,
  content: string,
  uniqueLink: string,
  accessType: string,
): Promise<Whiteboard> => {
  const res = await api.post(`${WHITEBOARD_API_URL}/addWhiteboard`, {
    owner,
    title,
    dateCreated,
    content,
    uniqueLink,
    accessType,
  });
  return res.data;
};

export default addWhiteboard;
