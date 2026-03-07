import axios from "axios";
import "./config";

type SyncUserResponse = {
  ok: boolean;
  token?: string;
  error?: string;
};

export async function syncUser(idToken: string) {
  const { data } = await axios.post<SyncUserResponse>(
    "/api/auth/sync",
    undefined,
    { headers: { Authorization: `Bearer ${idToken}` } }
  );
  return data;
}
