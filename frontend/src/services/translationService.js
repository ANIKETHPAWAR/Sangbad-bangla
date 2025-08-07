// Translation service for English to Hindi
class TranslationService {
  constructor() {
    this.baseUrl = 'https://api.mymemory.translated.net/get';
  }

  // Translate text from English to Hindi
  async translateToHindi(text) {
    try {
      if (!text || text.trim() === '') {
        return text;
      }

      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=en|hi`
      );

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  // Translate multiple texts
  async translateMultiple(texts) {
    const promises = texts.map(text => this.translateToHindi(text));
    return Promise.all(promises);
  }

  // Check if text is in English (basic check)
  isEnglish(text) {
    const englishRegex = /^[a-zA-Z\s.,!?;:'"()-]+$/;
    return englishRegex.test(text);
  }
}

export default new TranslationService(); 