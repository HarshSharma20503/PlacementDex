class GeminiService {
  constructor() {
    this.client = new GeminiClient();
  }

  async getSymbols() {
    return this.client.getSymbols();
  }
}
