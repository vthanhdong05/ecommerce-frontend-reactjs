export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentID: string | null;
  imageUrl: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export interface CategoryOption {
  id: string;
  name: string;
}
