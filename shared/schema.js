// User schema
export const FLAVORS = [
  'Cool Mint',
  'Citrus Chill',
  'Wintergreen',
  'Spearmint',
  'Peppermint',
  'Coffee',
  'Cinnamon',
  'Smooth',
  'Menthol'
];

export const MOODS = [
  'Buzzing',
  'Focused',
  'Chillaxed',
  'Energized',
  'Stress-Relief',
  'Social Hour',
  'Post-Meal',
  'Craving Crusher'
];

export const NICOTINE_STRENGTHS = [1.5, 3, 6, 8];

export const REACTION_TYPES = [
  'Nic Hit',
  'Love',
  'Impressive',
  'Wow',
  'Lol'
];

// CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = {
    FLAVORS,
    MOODS,
    NICOTINE_STRENGTHS,
    REACTION_TYPES,
  };
}