import { BASE_URL, navigateTo } from '../index.js';

export const isUserConnected = async () => {
	const response = await fetch(`${BASE_URL}/api/profile`);

	if (response.status === 401 || response.status === 400) {
		return (false);
	}
	return (true);
}

export const attachEventListenersToLinks = () => {
	// Select all links with the attribute data-link
	const links = document.querySelectorAll('[data-link]');

	// Attach event listener to each link
	links.forEach(link => {
		link.addEventListener("click", e => {
			e.preventDefault();
			navigateTo(link.href);
		});
	});
}
