export const dietaryOptions = [
  'Celiac Disease',
  'Coconut Allergy',
  'Corn Allergy',
  'Dairy Allergy',
  'Egg Allergy',
  'Fish Allergy',
  'Gluten Free',
  'Gluten Intolerance',
  'Halal',
  'Kiwi Allergy',
  'Kosher',
  'Lactose Intolerance',
  'Legume Allergy',
  'Mango Allergy',
  'Mustard Seeds Allergy',
  'Nightshade Vegetables Allergy',
  'Peanut Allergy',
  'Pescatarian',
  'Picky Eater',
  'Pineapple Allergy',
  'Potato Allergy',
  'Poultry Allergy',
  'Sesame Seed Allergy',
  'Shellfish Allergy',
  'Soy Protein Allergy',
  'Stone Fruits Allergy',
  'Strawberry Allergy',
  'Tree Nut Allergy',
  'Vegan',
  'Vegetarian',
];

export const dietaryNotesMaxLength = 5000;

export function hasProvidedDietaryInformation(requirements, notes) {
  return requirements.length > 0 || notes.trim().length > 0;
}

export function getCheckInHref(ticketId) {
  return `/check-in?id=${encodeURIComponent(ticketId)}`;
}
