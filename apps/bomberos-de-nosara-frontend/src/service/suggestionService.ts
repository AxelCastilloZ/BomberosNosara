import axios from 'axios';
import { Suggestion } from '../types/suggestion';

const BIN_ID='68280c258a456b79669f6333'; 
const API_KEY='$2a$10$jh5ro1ejselC7DUeTUrJwOJrxBFtnViB8YYFCfo/fR8wky6o5eoFK'; 
const BASE_URL=`https://api.jsonbin.io/v3/b/${BIN_ID}`;

const headers={
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY
};

export const getSuggestions=async (): Promise<Suggestion[]> => {
  const res=await axios.get(`${BASE_URL}/latest`, { headers });
  return res.data.record||[];
};

export const addSuggestion=async (suggestion: Suggestion): Promise<void> => {
  const suggestions=await getSuggestions();
  suggestions.unshift(suggestion);
  await axios.put(BASE_URL, suggestions, { headers });
};

export const deleteSuggestion=async (id: string): Promise<void> => {
  const suggestions=await getSuggestions();
  const filtered=suggestions.filter(s => s.id!==id);
  await axios.put(BASE_URL, filtered, { headers });
};