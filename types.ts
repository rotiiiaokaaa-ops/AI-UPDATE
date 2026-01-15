
export type Persona = 'sopan' | 'galak';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
  senderName?: string;
}

export interface WebProject {
  id: string;
  name: string;
  lastUpdated: number;
  history: string[];
  html: string;
  css: string;
  js: string;
  images: string[];
  uploadedFiles: {name: string, content: string}[];
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  base64?: string;
}

export enum AppTab {
  SOPAN_CHAT = 'sopan',
  GALAK_CHAT = 'galak',
  GROUP_CHAT = 'group',
  WEB_BUILDER = 'web',
  CREATIVE_STUDIO = 'creative',
  MEDIA_POWER = 'media',
  HOSTING_GUIDE = 'hosting'
}
