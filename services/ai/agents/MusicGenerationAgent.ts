class MusicGenerationAgent {
  private models = {
    MUSICGEN: 'facebook/musicgen',
    AUDIOCRAFT: 'facebook/audiocraft',
    MUBERT: 'mubert-api'
  };

  async generate(context: AIContext): Promise<AIResponse> {
    try {
      const model = this.selectModel(context);
      const prompt = this.createPrompt(context);
      
      const response = await this.callAPI(model, prompt);

      return {
        content: response.audio_url,
        model_used: model,
        processing_time: response.processing_time
      };
    } catch (error) {
      throw new Error(`Music generation failed: ${error.message}`);
    }
  }
} 