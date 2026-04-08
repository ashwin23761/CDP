import axios from "axios";

// Vite proxy rewrites /api → http://localhost:5000
// so all requests here automatically hit the Express backend.
const api = axios.create({ baseURL: "/api" });

/**
 * Create a new post.
 * @param {{ user_id: number, title: string, content: string }} payload
 */
export const createPost = async (payload) => {
  const { data } = await api.post("/posts", payload);
  return data; // { success, message, data: post }
};

/**
 * Fetch all posts (newest first).
 */
export const getAllPosts = async () => {
  const { data } = await api.get("/posts");
  return data; // { success, count, data: post[] }
};
