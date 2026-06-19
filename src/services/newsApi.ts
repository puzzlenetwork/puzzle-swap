import axios from "axios";
import { NEWS_API_URL } from "@src/constants";

export interface NewsListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  imageUrl: string | null;
  sourceType: string;
  sourceUrl: string;
  sourceAuthor: string | null;
  publishedAt: string;
  createdAt: string;
}

export interface NewsPost extends NewsListItem {
  content: string;
}

interface NewsListResponse {
  success: boolean;
  data: NewsListItem[];
  meta: { total: number; page: number; limit: number };
  error?: string;
}

interface NewsDetailResponse {
  success: boolean;
  data?: NewsPost;
  error?: string;
}

const client = axios.create({
  baseURL: NEWS_API_URL,
  timeout: 15000,
});

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${NEWS_API_URL}${imageUrl}`;
}

export async function fetchNewsList(
  page = 1,
  limit = 10,
  tag?: string,
): Promise<NewsListResponse> {
  const params: Record<string, string | number> = { page, limit };
  if (tag) params.tag = tag;

  const res = await client.get<NewsListResponse>("/api/news", { params });
  return res.data;
}

export async function fetchNewsBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const res = await client.get<NewsDetailResponse>(
      `/api/news/${encodeURIComponent(slug)}`,
    );
    return res.data.data ?? null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
