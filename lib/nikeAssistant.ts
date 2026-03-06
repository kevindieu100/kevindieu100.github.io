import { nikePegasusContext } from './productContext';

export interface ShopperContext {
  size?: string;
  preferences?: string[];
  mentionedNeeds?: string[];
  activityType?: string;
}

export interface SuggestedAction {
  id: string;
  label: string;
  type: 'cart' | 'compare' | 'alternative' | 'size' | 'info';
}

export interface AssistantResponse {
  reply: string;
  suggestedActions: SuggestedAction[];
  updatedShopperContext?: ShopperContext;
}

const product = nikePegasusContext;

function extractSize(message: string): string | null {
  const sizePatterns = [
    /size\s*(\d+(?:\.\d+)?)/i,
    /i'?m\s+(?:a\s+)?(?:size\s+)?(\d+(?:\.\d+)?)/i,
    /wear\s+(?:a\s+)?(?:size\s+)?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:us|men'?s?)?$/i,
  ];
  
  for (const pattern of sizePatterns) {
    const match = message.match(pattern);
    if (match) {
      const size = parseFloat(match[1]);
      if (size >= 5 && size <= 15) {
        return match[1];
      }
    }
  }
  return null;
}

function containsAny(message: string, keywords: string[]): boolean {
  const lower = message.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword.toLowerCase()));
}

export function generateAssistantResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  currentContext: ShopperContext = {}
): AssistantResponse {
  const lowerMessage = message.toLowerCase();
  const updatedContext: ShopperContext = { ...currentContext };
  const isFirstMessage = conversationHistory.length === 0;
  
  const mentionedSize = extractSize(message);
  if (mentionedSize) {
    updatedContext.size = mentionedSize;
  }

  // Size provided - this should be high priority
  if (mentionedSize) {
    updatedContext.size = mentionedSize;
    return {
      reply: `Got it, size ${mentionedSize}. That's in stock and ready to ship. Want me to add it to your cart?`,
      suggestedActions: [
        { id: 'add-cart', label: `Add size ${mentionedSize} to cart`, type: 'cart' },
        { id: 'more-questions', label: 'I have questions first', type: 'info' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Greeting
  if (isFirstMessage || containsAny(message, ['hello', 'hi', 'hey', 'help', 'start'])) {
    return {
      reply: `Hey! The Air Max 90 is a classic. What can I help you with?`,
      suggestedActions: [
        { id: 'tell-me', label: 'Tell me about it', type: 'info' },
        { id: 'sizing', label: 'Help with sizing', type: 'size' },
        { id: 'compare', label: 'Compare to other shoes', type: 'compare' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Direct comparison requests - check these BEFORE general compare
  if (containsAny(message, ['vs pegasus', 'versus pegasus', 'compare pegasus', 'pegasus'])) {
    return {
      reply: `Pegasus is a running shoe. Lighter, more responsive, built for miles. The 90 is lifestyle first. If you run more than a few times a week, Pegasus. For everyday style and comfort, the 90.`,
      suggestedActions: [
        { id: 'go-90', label: 'The 90 works for me', type: 'cart' },
        { id: 'show-pegasus', label: 'Show me Pegasus', type: 'alternative' },
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  if (containsAny(message, ['vs af1', 'vs air force', 'versus af1', 'compare af1', 'air force 1', 'force 1'])) {
    return {
      reply: `AF1 is heavier with a flat sole. Basketball heritage. The 90 has Air cushioning so it's way more comfortable for walking all day. For comfort, 90 wins.`,
      suggestedActions: [
        { id: 'go-90', label: 'Go with the 90', type: 'cart' },
        { id: 'show-af1', label: 'Show me AF1', type: 'alternative' },
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  if (containsAny(message, ['vs 97', 'versus 97', 'compare 97', 'air max 97', 'max 97'])) {
    return {
      reply: `The 97 has full length Air from heel to toe. The 90 has heel Air which most people prefer for everyday. 97 costs more too. For versatility, go 90.`,
      suggestedActions: [
        { id: 'go-90', label: 'Go with the 90', type: 'cart' },
        { id: 'show-97', label: 'Show me the 97', type: 'alternative' },
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // General compare question
  if (containsAny(message, ['compare', 'versus', 'vs', 'difference', 'other shoes', 'alternatives'])) {
    return {
      reply: `Sure! What do you want to compare it to?`,
      suggestedActions: [
        { id: 'vs-af1', label: 'vs Air Force 1', type: 'compare' },
        { id: 'vs-pegasus', label: 'vs Pegasus', type: 'compare' },
        { id: 'vs-97', label: 'vs Air Max 97', type: 'compare' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // About the shoe
  if (containsAny(message, ['tell me', 'what is', 'describe', 'about'])) {
    return {
      reply: `It's an icon since 1990. Visible Air cushioning, leather upper, Waffle sole. Looks good and feels comfortable all day. $140 with free shipping.`,
      suggestedActions: [
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
        { id: 'benefits', label: 'What are the benefits?', type: 'info' },
        { id: 'add-cart', label: 'Add to cart', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Benefits
  if (containsAny(message, ['benefit', 'features', 'why'])) {
    return {
      reply: `Air cushioning for comfort. Real leather for durability. Waffle outsole for grip. Built to last and feel good all day.`,
      suggestedActions: [
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
        { id: 'add-cart', label: 'Add to cart', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Size availability question
  if (containsAny(message, ['available', 'in stock', 'what size'])) {
    return {
      reply: `We have sizes 7 through 14 in stock. Most sizes ship free in 4 to 9 days. What size do you wear?`,
      suggestedActions: [
        { id: 'size-9', label: '9', type: 'size' },
        { id: 'size-10', label: '10', type: 'size' },
        { id: 'size-11', label: '11', type: 'size' },
        { id: 'size-12', label: '12', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Sizing/fit questions
  if (containsAny(message, ['sizing', 'size should', 'true to size', 'runs big', 'runs small', 'fit', 'how does it fit'])) {
    return {
      reply: `Runs true to size. If you're between sizes or have wide feet, go half size up. What do you usually wear?`,
      suggestedActions: [
        { id: 'size-9', label: '9', type: 'size' },
        { id: 'size-10', label: '10', type: 'size' },
        { id: 'size-11', label: '11', type: 'size' },
        { id: 'size-12', label: '12', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Everyday use
  if (containsAny(message, ['everyday', 'daily', 'casual', 'walk', 'work'])) {
    updatedContext.activityType = 'everyday';
    return {
      reply: `Perfect choice. The Air cushioning handles long days. What size?`,
      suggestedActions: [
        { id: 'size-10', label: '10', type: 'size' },
        { id: 'size-11', label: '11', type: 'size' },
        { id: 'sizing-help', label: 'Not sure of my size', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Gym/workout
  if (containsAny(message, ['workout', 'gym', 'exercise', 'training', 'run'])) {
    updatedContext.activityType = 'workout';
    return {
      reply: `Great for gym. For serious running check out Pegasus. But for gym plus everyday the 90 covers both. What size?`,
      suggestedActions: [
        { id: 'size-10', label: '10', type: 'size' },
        { id: 'vs-pegasus', label: 'Compare to Pegasus', type: 'compare' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Style
  if (containsAny(message, ['style', 'fresh', 'kicks', 'look', 'fashion', 'streetwear'])) {
    updatedContext.activityType = 'style';
    return {
      reply: `Classic streetwear since 1990. The Black Volt colorway goes with everything. What size?`,
      suggestedActions: [
        { id: 'size-10', label: '10', type: 'size' },
        { id: 'size-11', label: '11', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Stability needs
  if (containsAny(message, ['flat feet', 'overpronation', 'stability', 'support', 'arch', 'pronation'])) {
    return {
      reply: `The 90 is neutral so no built in arch support. For stability I'd recommend Structure instead. Or try the 90 with a supportive insole.`,
      suggestedActions: [
        { id: 'show-structure', label: 'Show me Structure', type: 'alternative' },
        { id: 'try-90', label: 'I\'ll try the 90', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Wide feet
  if (containsAny(message, ['wide feet', 'wide foot', 'narrow', 'width', 'roomy', 'tight'])) {
    const currentSize = updatedContext.size ? parseFloat(updatedContext.size) : 10;
    const recommendedSize = currentSize + 0.5;
    return {
      reply: `Medium width. For wide feet go half size up. So ${recommendedSize} instead of ${currentSize}. Want me to add that?`,
      suggestedActions: [
        { id: 'add-half-up', label: `Add size ${recommendedSize}`, type: 'cart' },
        { id: 'keep-size', label: `Keep size ${currentSize}`, type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Best for
  if (containsAny(message, ['best for', 'good for', 'use case'])) {
    return {
      reply: `Everyday comfort, streetwear, light gym work. $140 with free shipping and returns.`,
      suggestedActions: [
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
        { id: 'add-cart', label: 'Add to cart', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Should I buy
  if (containsAny(message, ['should i', 'worth', 'buy', 'get this', 'cop', 'recommend'])) {
    const sizePrompt = updatedContext.size ? `Want me to add size ${updatedContext.size}?` : 'What size?';
    return {
      reply: `Yes. Classic since 1990, comfortable all day, holds up for years. $140 with free returns. ${sizePrompt}`,
      suggestedActions: updatedContext.size 
        ? [{ id: 'add-cart', label: `Add size ${updatedContext.size}`, type: 'cart' }, { id: 'questions', label: 'More questions', type: 'info' }]
        : [{ id: 'size-10', label: '10', type: 'size' }, { id: 'size-11', label: '11', type: 'size' }],
      updatedShopperContext: updatedContext,
    };
  }

  // Cushioning
  if (containsAny(message, ['cushion', 'comfort', 'soft', 'air unit', 'foam', 'midsole'])) {
    return {
      reply: `Max Air in the heel absorbs impact. Foam midsole keeps it light. Great for all day.`,
      suggestedActions: [
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
        { id: 'add-cart', label: 'Add to cart', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Price
  if (containsAny(message, ['price', 'cost', 'how much', 'expensive'])) {
    return {
      reply: `$140 with free shipping and free returns. Solid value.`,
      suggestedActions: [
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
        { id: 'add-cart', label: 'Add to cart', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Colors
  if (containsAny(message, ['color', 'colours', 'black', 'white', 'volt', 'colorway'])) {
    return {
      reply: `This is Black Volt. The volt accent makes it pop. We have other colorways too.`,
      suggestedActions: [
        { id: 'this-color', label: 'This color works', type: 'cart' },
        { id: 'other-colors', label: 'Show other colors', type: 'info' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Shipping
  if (containsAny(message, ['shipping', 'delivery', 'return', 'exchange', 'how long'])) {
    return {
      reply: `Free shipping in 4 to 9 days. Free returns within 60 days. No risk.`,
      suggestedActions: [
        { id: 'sizing', label: 'What size should I get?', type: 'size' },
        { id: 'add-cart', label: 'Add to cart', type: 'cart' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Add to cart
  if (containsAny(message, ['add to cart', 'add to bag', 'buy now', 'purchase', 'checkout', 'get it', 'i\'ll take', 'i want', 'go with', 'works for me'])) {
    if (updatedContext.size) {
      return {
        reply: `Adding size ${updatedContext.size} to your cart. Free shipping, free returns if it doesn't work out.`,
        suggestedActions: [
          { id: 'confirm', label: 'Confirm', type: 'cart' },
          { id: 'change-size', label: 'Change size', type: 'size' },
        ],
        updatedShopperContext: updatedContext,
      };
    }
    return {
      reply: `What size should I add?`,
      suggestedActions: [
        { id: 'size-9', label: '9', type: 'size' },
        { id: 'size-10', label: '10', type: 'size' },
        { id: 'size-11', label: '11', type: 'size' },
        { id: 'size-12', label: '12', type: 'size' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Questions/more info
  if (containsAny(message, ['question', 'more info', 'tell me more'])) {
    return {
      reply: `Sure, what do you want to know? I can help with sizing, comparisons, or product details.`,
      suggestedActions: [
        { id: 'sizing', label: 'Sizing', type: 'size' },
        { id: 'compare', label: 'Comparisons', type: 'compare' },
        { id: 'benefits', label: 'Benefits', type: 'info' },
      ],
      updatedShopperContext: updatedContext,
    };
  }

  // Default
  const sizeAction = updatedContext.size 
    ? { id: 'add-cart', label: `Add size ${updatedContext.size}`, type: 'cart' as const }
    : { id: 'sizing', label: 'Help with sizing', type: 'size' as const };
    
  return {
    reply: `Anything else I can help with?`,
    suggestedActions: [
      sizeAction,
      { id: 'compare', label: 'Compare shoes', type: 'compare' },
      { id: 'benefits', label: 'Product benefits', type: 'info' },
    ],
    updatedShopperContext: updatedContext,
  };
}
