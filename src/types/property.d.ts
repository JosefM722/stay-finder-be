export interface NewProperty {
  id?: string;
  title: string;
  description: string;
  city: string;
  country: string;
  price_per_night: number;
  max_guests: number;
}

export interface Property extends NewProperty {
  id: string;
}