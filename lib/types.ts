export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  name: string;
  phone: string;
  requirement?: string | null;
  location?: string | null;
  budget?: string | null;
  source?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  followUpDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  userId: string;
  title: string;
  location: string;
  price: string;
  configuration?: string | null;
  area?: string | null;
  availability?: string | null;
  notes?: string | null;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParsedLead {
  name?: string;
  phone?: string;
  requirement?: string;
  location?: string;
  budget?: string;
  source?: string;
  notes?: string;
  followUpDate?: string;
}

export type LeadFormData = Omit<
  Lead,
  "id" | "userId" | "createdAt" | "updatedAt" | "followUpDone"
> & { followUpDone?: boolean };

export type PropertyFormData = Omit<
  Property,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type SpeechLanguage = "en-IN" | "hi-IN" | "pa-IN";
