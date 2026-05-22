export interface TheoryFolder {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TheoryArticle {
  id?: number;
  title: string;
  category: string;
  summary?: string;
  content: string;
  folder?: TheoryFolder;
  createdAt?: string;
  updatedAt?: string;
}
