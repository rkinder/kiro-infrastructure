export interface TelosContext {
  mission?: string;
  beliefs?: string[];
  goals?: string[];
  preferences?: Record<string, any>;
}

export interface SkillMetadata {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
  workflows?: string[];
}

export interface ResponseFormat {
  summary: string;
  analysis?: string;
  actions?: string[];
  results?: string;
  status: string;
  capture?: string;
  next?: string;
  story_explanation?: string[];
  rate?: number;
  voice_output?: string;
}

export interface CoreConfig {
  telosPath: string;
  skillsPath: string;
  responseFormat: {
    voiceWordLimit: number;
    includeStoryExplanation: boolean;
  };
}
