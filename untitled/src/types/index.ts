export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  image?: {
    data: string; // Base64 string
    mimeType: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type ToneType = 'professional' | 'friendly' | 'formal' | 'casual';

export interface CaptionsResponse {
  instagram: string;
  linkedin: string;
  general: string;
}

export interface ResumeImprovement {
  before: string;
  after: string;
  explanation: string;
}

export interface CertificateData {
  recipientName: string;
  courseTitle: string;
  duration: string;
  certificateText: string;
}

export interface ColorSwatch {
  hex: string;
  name: string;
}

export interface ThemeSuggestion {
  colors: ColorSwatch[];
  fonts: string[];
  background: string;
  tips?: string[];
}

export interface ToolMetadata {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
  day: string;
}

export interface AuthUser {
  email: string;
  fullName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}
