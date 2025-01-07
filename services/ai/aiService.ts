interface AIContext {
  mood?: string;
  time_period?: string;
  location?: string;
  people?: string[];
  occasion?: string;
  existing_content?: {
    description?: string;
    image_url?: string;
    music_url?: string;
  };
}

interface AIResponse {
  content: string;
  model_used: string;
  tokens_used?: number;
  processing_time?: number;
}

class AIService {
  private textGenerator: TextGenerationAgent;
  private imageGenerator: ImageGenerationAgent;
  private musicGenerator: MusicGenerationAgent;
  private videoGenerator: VideoGenerationAgent;
  private imageAnalyzer: ImageAnalysisAgent;

  constructor() {
    this.textGenerator = new TextGenerationAgent();
    this.imageGenerator = new ImageGenerationAgent();
    this.musicGenerator = new MusicGenerationAgent();
    this.videoGenerator = new VideoGenerationAgent();
    this.imageAnalyzer = new ImageAnalysisAgent();
  }

  async generateContent(type: 'text' | 'image' | 'music' | 'video', context: AIContext): Promise<AIResponse> {
    try {
      switch (type) {
        case 'text':
          return await this.textGenerator.generate(context);
        case 'image':
          return await this.imageGenerator.generate(context);
        case 'music':
          return await this.musicGenerator.generate(context);
        case 'video':
          return await this.videoGenerator.generate(context);
        default:
          throw new Error('Unsupported content type');
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      throw error;
    }
  }

  async analyzeImage(imageUrl: string, options?: any): Promise<AnalysisResult> {
    try {
      return await this.imageAnalyzer.analyze(imageUrl, options);
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }
} 