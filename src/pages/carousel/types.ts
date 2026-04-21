export interface CarouselSlide {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imagePublicId: string;
  link: string;
  buttonText: string;
  order: number;
  isActive: boolean;
  publishAt?: string;
  expireAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselSlideFormData {
  title: string;
  subtitle?: string;
  imageUrl: string;
  imagePublicId: string;
  link: string;
  buttonText: string;
  isActive: boolean;
  publishAt?: string;
  expireAt?: string;
}
