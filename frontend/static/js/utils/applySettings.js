import { setLanguage } from './languages.js';
import { ids, BIG_TEXT, DEFAULT_TEXT } from '../index.js';

// // Backgorund gradients
// const applyGraphics = () => {
// 	let graphicsSetting = localStorage.getItem('graphics');

// 	// If the graphics setting is not set, set it to "medium" by default
// 	if (!graphicsSetting) {
// 		localStorage.setItem('graphics', 'medium');
// 		graphicsSetting = 'medium';
// 	}

// 	const gradientsContainer = document.querySelector('.gradients-container');
// 	//const videoBackground = document.querySelector('#video-background');

// 	if (graphicsSetting === 'ultra') {
// 		gradientsContainer.style.display = 'block';
// 		//videoBackground.style.display = 'none';
// 	} else if (graphicsSetting === 'medium') {
// 		gradientsContainer.style.display = 'none';
// 		//videoBackground.style.display = 'block';
// 	} else if (graphicsSetting === 'none') {
// 		gradientsContainer.style.display = 'none';
// 		//videoBackground.style.display = 'none';
// 	}
// }

// Apply the settings from the local storage
export const applySettings = async () => {
	//applyGraphics();
	//applyTextSize();
	await setLanguage(localStorage.getItem('language') ? localStorage.getItem('language') : 'en');
}
