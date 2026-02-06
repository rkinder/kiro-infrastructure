import type { TelosContext, CoreConfig, ResponseFormat } from './types';
import { ResponseFormatter } from './response-formatter';
import { ConfigManager } from './config-manager';
import { TelosContextLoader } from './context-loader';
import { join } from 'path';

export class CoreSkill {
  private config: CoreConfig;
  private configManager: ConfigManager;
  private contextLoader: TelosContextLoader;
  private telosContext?: TelosContext;
  private responseFormatter: ResponseFormatter;
  private initialized: boolean = false;
  
  constructor(config?: Partial<CoreConfig>) {
    const HOME = process.env.HOME || '';
    const skillPath = join(HOME, '.kiro/skills/CORE');
    
    // Initialize config manager
    this.configManager = new ConfigManager(
      join(skillPath, 'system/config.yaml'),
      join(skillPath, 'user/config.yaml')
    );
    
    // Load and merge configurations
    const loadedConfig = this.configManager.load();
    
    this.config = {
      telosPath: join(HOME, '.kiro/telos'),
      skillsPath: join(HOME, '.kiro/skills'),
      responseFormat: {
        voiceWordLimit: loadedConfig.responseFormat?.voiceWordLimit || 150,
        includeStoryExplanation: loadedConfig.responseFormat?.includeStoryExplanation ?? true
      },
      ...config
    };
    
    this.responseFormatter = new ResponseFormatter(
      this.config.responseFormat.voiceWordLimit
    );
    
    this.contextLoader = new TelosContextLoader(this.config.telosPath);
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) {
      return; // Idempotent
    }
    
    const startTime = Date.now();
    
    try {
      // Load TELOS context (optional, non-blocking)
      await this.loadTelosContext();
      
      this.initialized = true;
      
      const duration = Date.now() - startTime;
      if (duration > 2000) {
        console.warn(`CORE initialization took ${duration}ms (>2s threshold)`);
      }
    } catch (error) {
      console.error('CORE initialization failed:', error);
      throw error;
    }
  }
  
  private async loadTelosContext(): Promise<void> {
    try {
      this.telosContext = await this.contextLoader.load();
    } catch (error) {
      console.warn('TELOS context loading failed, continuing with empty context');
      this.telosContext = {};
    }
  }
  
  formatResponse(response: Partial<ResponseFormat>): string {
    return this.responseFormatter.format(response);
  }
  
  validateResponse(response: Partial<ResponseFormat>): { valid: boolean; errors: string[] } {
    return this.responseFormatter.validate(response);
  }
  
  getConfig(key: string): any {
    return this.configManager.get(key);
  }
  
  getContext(): TelosContext | undefined {
    return this.telosContext;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}
