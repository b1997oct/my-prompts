import axios from "axios";
import "./config";

export interface Prompt {
  _id: string;
  prompt: string;
  source?: string;
  tokenId?: string;
  is_delete?: boolean;
  email?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}

type ListPromptsResponse = {
  ok: boolean;
  prompts?: Prompt[];
  error?: string;
};

type DeletePromptResponse = {
  ok: boolean;
  error?: string;
};

export async function listPrompts() {
  const { data } = await axios.get<ListPromptsResponse>("/api/promt");
  return data;
}

export async function deletePromptById(id: string) {
  const { data } = await axios.delete<DeletePromptResponse>(`/api/promt/${id}`);
  return data;
}
