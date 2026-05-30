/// <reference types="expo/types" />

// Allow side-effect CSS imports (e.g. `import '@/global.css'`).
// Mirrors the declaration in the auto-generated `expo-env.d.ts`, which is
// gitignored and therefore unavailable in CI.
declare module '*.css';
