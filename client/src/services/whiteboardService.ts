import { Whiteboard } from '../types/types';
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

const getWhiteboard = async (uniqueLink: string): Promise<Whiteboard> => {
  const res = await fetch(`${WHITEBOARD_API_URL}/${uniqueLink}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch whiteboard: ${res.status}`);
  }
  console.log('response!!!', res);
  return res.json();
};

export { getWhiteboard, addWhiteboard };
