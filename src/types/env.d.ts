// Tells TypeScript that `import {GEMINI_API_KEY} from '@env'` is valid.
// The real value is injected from .env by the react-native-dotenv Babel plugin.
declare module '@env' {
  export const GEMINI_API_KEY: string;
}
