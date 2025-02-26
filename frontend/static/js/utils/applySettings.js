import { setLanguage } from './languages.js';
import { ids, BIG_TEXT, DEFAULT_TEXT } from '../index.js';

// Apply the settings from the local storage
export const applySettings = async () => {
	await setLanguage(localStorage.getItem('language') ? localStorage.getItem('language') : 'en');
}
