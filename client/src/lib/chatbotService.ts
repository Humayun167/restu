import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface Product {
  _id: string;
  name: string;
  description: string[];
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  inStock: boolean;
}

interface ChatbotResponse {
  text: string;
  suggestedProducts: Product[];
}

export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate AI response with product suggestions
   */
  async generateResponse(userMessage: string, products: Product[]): Promise<ChatbotResponse> {
    try {
      console.log('🤖 Chatbot - Generating response for:', userMessage);
      console.log('🍽️ Available products:', products.length);
      
      // If no products available, return helpful message
      if (!products || products.length === 0) {
        console.warn('⚠️ No products available for chatbot');
        return this.generateFallbackResponse(userMessage, []);
      }

      // Filter products based on user query
      const suggestedProducts = this.findRelevantProducts(userMessage, products);
      console.log('🎯 Found suggested products:', suggestedProducts.length);
      
      // Create context for the AI
      const context = this.buildContext(products, suggestedProducts);
      
      // Generate AI response
      const prompt = this.buildPrompt(userMessage, context);
      console.log('📝 Sending prompt to AI...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ AI response received:', text.substring(0, 100) + '...');
      
      return {
        text: text.trim(),
        suggestedProducts: suggestedProducts.slice(0, 3), // Limit to 3 suggestions
      };
    } catch (error) {
      console.error('❌ Error generating chatbot response:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userMessage,
        productsCount: products?.length || 0
      });
      
      // Return fallback response instead of throwing error
      return this.generateFallbackResponse(userMessage, products);
    }
  }

  /**
   * Find products relevant to user query
   */
  private findRelevantProducts(query: string, allProducts: Product[]): Product[] {
    const searchTerms = query.toLowerCase().split(' ');
    const scoredProducts: { product: Product; score: number }[] = [];

    allProducts.forEach(product => {
      let score = 0;
      const productText = `${product.name} ${product.category} ${product.description.join(' ')}`.toLowerCase();

      // Exact matches get highest score
      searchTerms.forEach(term => {
        if (productText.includes(term)) {
          score += term.length > 3 ? 3 : 2; // Longer terms get higher score
        }
      });

      // Category matching
      if (this.matchesCategory(query, product.category)) {
        score += 5;
      }

      // Dietary preferences
      if (this.matchesDietaryPreferences(query, product)) {
        score += 4;
      }

      // Meal type matching
      if (this.matchesMealType(query, product)) {
        score += 3;
      }

      // Price-based suggestions
      if (this.matchesPricePreference(query, product)) {
        score += 2;
      }

      // Only include in-stock products
      if (product.inStock && score > 0) {
        scoredProducts.push({ product, score });
      }
    });

    // Sort by score and return top products
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 6); // Get top 6 matches
  }

  /**
   * Check if query matches product category
   */
  private matchesCategory(query: string, category: string): boolean {
    const categoryKeywords = {
      'Salad': ['salad', 'fresh', 'healthy', 'green', 'vegetables', 'light'],
      'Rolls': ['roll', 'wrap', 'sandwich', 'handheld'],
      'Deserts': ['dessert', 'sweet', 'cake', 'ice cream', 'chocolate'],
      'Sandwich': ['sandwich', 'bread', 'sub', 'panini'],
      'Cake': ['cake', 'birthday', 'celebration', 'sweet'],
      'Pure Veg': ['vegetarian', 'veg', 'plant-based', 'veggie'],
      'Pasta': ['pasta', 'spaghetti', 'noodles', 'italian'],
      'Noodles': ['noodles', 'ramen', 'asian', 'stir-fry']
    };

    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];
    const queryLower = query.toLowerCase();
    
    return keywords.some(keyword => queryLower.includes(keyword)) || 
           queryLower.includes(category.toLowerCase());
  }

  /**
   * Check dietary preferences
   */
  private matchesDietaryPreferences(query: string, product: Product): boolean {
    const queryLower = query.toLowerCase();
    
    // Vegetarian preferences
    if (queryLower.includes('vegetarian') || queryLower.includes('veg')) {
      return product.category === 'Pure Veg' || product.category === 'Salad';
    }
    
    // Healthy options
    if (queryLower.includes('healthy') || queryLower.includes('light') || queryLower.includes('diet')) {
      return product.category === 'Salad';
    }
    
    return false;
  }

  /**
   * Check meal type preferences
   */
  private matchesMealType(query: string, product: Product): boolean {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('breakfast') || queryLower.includes('morning')) {
      return product.category === 'Sandwich' || product.category === 'Salad';
    }
    
    if (queryLower.includes('lunch') || queryLower.includes('dinner')) {
      return ['Pasta', 'Noodles', 'Sandwich', 'Rolls'].includes(product.category);
    }
    
    if (queryLower.includes('snack') || queryLower.includes('light meal')) {
      return ['Rolls', 'Sandwich', 'Salad'].includes(product.category);
    }
    
    if (queryLower.includes('dessert') || queryLower.includes('sweet')) {
      return product.category === 'Deserts' || product.category === 'Cake';
    }
    
    return false;
  }

  /**
   * Check price preferences
   */
  private matchesPricePreference(query: string, product: Product): boolean {
    const queryLower = query.toLowerCase();
    const price = product.offerPrice || product.price;
    
    if (queryLower.includes('cheap') || queryLower.includes('budget') || queryLower.includes('affordable')) {
      return price < 300; // Adjust based on your price range
    }
    
    if (queryLower.includes('premium') || queryLower.includes('expensive') || queryLower.includes('fancy')) {
      return price > 500; // Adjust based on your price range
    }
    
    return false;
  }

  /**
   * Build context for AI prompt
   */
  private buildContext(allProducts: Product[], suggestedProducts: Product[]): string {
    if (!allProducts.length) {
      return `You are a helpful AI assistant for a restaurant. Unfortunately, our menu is currently being updated. Please ask about general dining preferences and I'll help as best I can.\n\n`;
    }

    const categories = [...new Set(allProducts.map(p => p.category))];
    const avgPrice = allProducts.reduce((sum, p) => sum + (p.offerPrice || p.price), 0) / allProducts.length;
    
    let context = `You are a helpful AI assistant for a restaurant. Here's what we offer:\n\n`;
    context += `Categories: ${categories.join(', ')}\n`;
    context += `Average price: ৳${avgPrice.toFixed(0)}\n`;
    context += `Total menu items: ${allProducts.length}\n\n`;
    
    if (suggestedProducts.length > 0) {
      context += `Based on the user's request, here are some relevant dishes:\n`;
      suggestedProducts.forEach((product, index) => {
        context += `${index + 1}. ${product.name} - ${product.category} - ৳${product.offerPrice || product.price}\n`;
        context += `   Description: ${product.description.join(', ')}\n`;
      });
    }
    
    return context;
  }

  /**
   * Build prompt for AI
   */
  private buildPrompt(userMessage: string, context: string): string {
    return `${context}

User Question: "${userMessage}"

You're a friendly restaurant staff member helping customers choose food. Keep it casual and conversational (2-3 sentences max). 
Talk like you're recommending dishes to a friend. Use the currency symbol ৳ for prices.
If they ask for something we don't have, tell them clearly and suggest what we DO have instead.
Don't sound robotic or mention being an AI - just be natural and helpful like restaurant staff would be.

Response:`;
  }

  /**
   * Generate fallback response without AI when service fails
   */
  generateFallbackResponse(userMessage: string, products: Product[]): ChatbotResponse {
    console.log('🔄 Using fallback response system');
    const queryLower = userMessage.toLowerCase();
    
    // Handle common greetings
    if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
      return {
        text: "Hey there! Welcome to our place! What can I get you today? Hungry for anything specific?",
        suggestedProducts: products.filter(p => p.inStock).slice(0, 3)
      };
    }
    
    // Handle thank you messages
    if (queryLower.includes('thank') || queryLower.includes('thanks')) {
      return {
        text: "No problem! Anything else catching your eye on the menu?",
        suggestedProducts: []
      };
    }
    
    // Check for specific items we don't have
    if (queryLower.includes('drink') || queryLower.includes('beverage') || queryLower.includes('juice') || 
        queryLower.includes('soda') || queryLower.includes('coffee') || queryLower.includes('tea') || 
        queryLower.includes('water') || queryLower.includes('beer') || queryLower.includes('wine')) {
      return {
        text: "Sorry, we don't have drinks on our menu right now - we're focused on food! But we've got some great dishes if you're hungry!",
        suggestedProducts: products.filter(p => p.inStock).slice(0, 3)
      };
    }
    
    // Check for other items we might not have
    if (queryLower.includes('pizza') && !products.some(p => p.name.toLowerCase().includes('pizza'))) {
      return {
        text: "We don't have pizza, but we've got some awesome pasta and other dishes that might hit the spot!",
        suggestedProducts: products.filter(p => p.category.toLowerCase().includes('pasta') || 
                                          p.category.toLowerCase().includes('sandwich')).slice(0, 3)
      };
    }
    
    if (queryLower.includes('burger') && !products.some(p => p.name.toLowerCase().includes('burger'))) {
      return {
        text: "No burgers here, but our sandwiches are pretty amazing! Check these out:",
        suggestedProducts: products.filter(p => p.category.toLowerCase().includes('sandwich')).slice(0, 3)
      };
    }
    
    // Find relevant products using keyword matching
    const suggestedProducts = this.findRelevantProducts(userMessage, products);
    
    let text = "";
    
    if (suggestedProducts.length > 0) {
      const categories = [...new Set(suggestedProducts.map(p => p.category))];
      const productNames = suggestedProducts.slice(0, 2).map(p => p.name).join(' and ');
      
      // Create personalized responses based on what was found
      if (queryLower.includes('vegetarian') || queryLower.includes('veg')) {
        text = `Oh nice! Got some amazing veggie dishes. Try ${productNames} - customers love them!`;
      } else if (queryLower.includes('dessert') || queryLower.includes('sweet')) {
        text = `Sweet tooth, huh? You gotta try ${productNames} - they're seriously good!`;
      } else if (queryLower.includes('cheap') || queryLower.includes('budget')) {
        text = `Looking for good deals? ${productNames} are tasty and won't break the bank!`;
      } else if (queryLower.includes('spicy') || queryLower.includes('hot')) {
        text = `Want some heat? 🌶️ ${productNames} will definitely bring the spice!`;
      } else {
        text = `Found some ${categories.join(' and ')} that might hit the spot! ${productNames} are really good.`;
      }
    } else {
      // General response when no specific matches
      const allCategories = [...new Set(products.map(p => p.category))];
      text = `We've got tons of good stuff! ${allCategories.join(', ')} - what sounds good to you? You can add anything you like straight to your cart!`;
      
      // Show some popular items as fallback
      const popularItems = products.filter(p => p.inStock).slice(0, 3);
      return {
        text,
        suggestedProducts: popularItems
      };
    }
    
    return {
      text,
      suggestedProducts: suggestedProducts.slice(0, 3)
    };
  }
}