export interface ProductContext {
  id: string;
  name: string;
  category: string;
  price: number;
  style: string;
  color: string;
  origin: string;
  tagline: string;
  description: string;
  benefits: string[];
  intendedUse: string[];
  keyFeatures: string[];
  cushioning: string;
  fitNotes: string;
  idealCustomer: string[];
  notIdealFor: string[];
  comparisonNotes: Record<string, string>;
  alternativeModels: Array<{ name: string; reason: string }>;
  sizingAdvice: string;
  shipping: string;
}

export const nikePegasusContext: ProductContext = {
  id: 'DV0036-001',
  name: 'Nike Air Max 90',
  category: "Men's Shoes",
  price: 140,
  style: 'DV0036-001',
  color: 'Black/Volt/Anthracite/White',
  origin: 'Vietnam',
  tagline: 'Nothing as icons should be left satisfhat. Icons should be Icons a classic that brings out icons some icons of the past.',
  description: 'The Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details. Classic colors celebrate your fresh look while Max Air cushioning adds comfort to your journey.',
  benefits: [
    'Originally designed for running, visible Nike Air cushioning puts the history of comfort beneath your feet.',
    'Real and synthetic leather, plus textiles, add durability and support.',
    'Rubber Waffle outsole delivers traction.',
    'Foam midsole with Air-Sole unit for lightweight cushioning.',
  ],
  intendedUse: [
    'Everyday lifestyle wear',
    'Casual outings',
    'Light gym sessions',
    'All-day comfort',
    'Streetwear',
  ],
  keyFeatures: [
    'Visible Air cushioning in the heel',
    'Iconic Waffle sole',
    'Stitched overlays',
    'Classic TPU details',
    'Real and synthetic leather upper',
    'Foam midsole with Air-Sole unit',
  ],
  cushioning: 'Max Air unit in the heel provides responsive cushioning. Foam midsole adds lightweight comfort. The Air-Sole unit absorbs impact and provides all-day wearability.',
  fitNotes: 'Runs true to size. Medium width. For wider feet, consider going up half a size. The leather breaks in after a few wears for a more personalized fit.',
  idealCustomer: [
    'People who want an iconic, timeless sneaker',
    'All-day wearers who need comfort',
    'Streetwear enthusiasts',
    'Those who appreciate sneaker history',
    'Gym-goers who also want lifestyle versatility',
  ],
  notIdealFor: [
    'Serious runners needing performance running shoes',
    'People with flat feet or overpronation needing stability support',
    'Those looking for a lightweight racing shoe',
  ],
  comparisonNotes: {
    'Air Force 1': 'AF1 is heavier with a flat basketball sole. Air Max 90 has visible Air cushioning making it more comfortable for walking and all-day wear. If you want that chunky court look, AF1. For comfort, the 90 wins.',
    'Air Max 97': 'The 97 has full-length Air from heel to toe. The 90 has heel Air which most prefer for everyday comfort. 97 is pricier and has a sleeker silhouette. For versatility, go 90.',
    'Pegasus': 'Pegasus is a dedicated running shoe - lighter, more responsive, built for miles. Air Max 90 is lifestyle first. If running more than a few miles weekly, Pegasus. For everything else, the 90.',
    'Air Max 1': 'Same Air technology, different silhouette. The 90 has a slightly more aggressive look with the TPU details. Both are classics. The 90 tends to be more popular for streetwear.',
  },
  alternativeModels: [
    { name: 'Nike Structure', reason: 'For those needing stability and arch support' },
    { name: 'Nike Infinity', reason: 'Maximum cushioning for injury-prone runners' },
    { name: 'Air Max 97', reason: 'Full-length Air if you want more cushioning throughout' },
    { name: 'Air Force 1', reason: 'Classic basketball heritage look' },
  ],
  sizingAdvice: 'True to size for most. If between sizes, go up. Wide feet should go half size up. Free returns within 60 days if the fit isn\'t right.',
  shipping: 'Free delivery in 4-9 business days. Free returns within 60 days.',
};
