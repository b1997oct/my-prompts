import axios from "axios";

export interface ApiKey {
  _id: string;
  key: string;
  createdAt: string;
  isActive: boolean;
}

type ListKeysResponse = {
  ok: boolean;
  keys?: ApiKey[];
  error?: string;
};

type CreateKeyResponse = {
  ok: boolean;
  key?: ApiKey;
  error?: string;
};

type UpdateKeyResponse = {
  ok: boolean;
  key?: ApiKey;
  error?: string;
};

export async function listApiKeys(status?: "active" | "inactive") {
  const params = status ? { status } : undefined;
  const { data } = await axios.get<ListKeysResponse>("/api/keys", { params });
  return data;
}

export async function createApiKey() {
  const { data } = await axios.post<CreateKeyResponse>("/api/keys");
  return data;
}

export async function updateApiKey(apiKeyId: string, isActive: boolean) {
  const { data } = await axios.patch<UpdateKeyResponse>(`/api/keys/${apiKeyId}`, { isActive });
  return data;
}
