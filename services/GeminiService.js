
class GeminiService {
  async initialize()
  {
    //this.prompt=
    
  }
  constructor() {
    this.client = new GeminiClient();
  }

  async getSymbols() {
    return this.client.getSymbols();
  }
}
