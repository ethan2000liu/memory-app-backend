class ImageGenerationAgent {
  private models = {
    DALLE3: 'dall-e-3',
    DALLE2: 'dall-e-2',
    STABLE_DIFFUSION: 'stable-diffusion'
  };

  async generate(context: AIContext): Promise<AIResponse> {
    try {
      const model = this.selectModel(context);
      const prompt = this.createPrompt(context);
      
      const response = await this.callAPI(model, prompt);

      return {
        content: response.image_url,
        model_used: model,
        processing_time: response.processing_time
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
} 