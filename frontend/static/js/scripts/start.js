
// export function start () {}
import { setLanguage } from '../utils/languages.js';

// Function that will be called when the view is loaded
export function start() {
	// Graphics settings
	const ultraRadio = document.getElementById("graphics-ultra-radio");
	const mediumRadio = document.getElementById("graphics-medium-radio");
	const noneRadio = document.getElementById("graphics-none-radio");

	// Switch language setting
	document.getElementById('languageSwitcher').addEventListener('change', (event) => {
		setLanguage(event.target.value);
		// Save the language setting in the local storage
		localStorage.setItem('language', event.target.value);
	});

	// Apply the language setting from the local storage
	const languageSetting = localStorage.getItem('language');
	document.getElementById('languageSwitcher').value = languageSetting ? languageSetting : 'en';


}
