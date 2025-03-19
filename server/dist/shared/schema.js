"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REACTION_TYPES = exports.NICOTINE_STRENGTHS = exports.MOODS = exports.FLAVORS = exports.insertUserSchema = void 0;
exports.insertUserSchema = {
    username: "string",
    password: "string",
    displayName: "string",
    bio: "string?",
    avatar: "string?",
};
// Pre-defined options
exports.FLAVORS = [
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
exports.MOODS = [
    'Buzzing',
    'Focused',
    'Chillaxed',
    'Energized',
    'Stress-Relief',
    'Social Hour',
    'Post-Meal',
    'Craving Crusher'
];
exports.NICOTINE_STRENGTHS = [1.5, 3, 6, 8];
exports.REACTION_TYPES = [
    'Nic Hit',
    'Love',
    'Impressive',
    'Wow',
    'Lol'
];
