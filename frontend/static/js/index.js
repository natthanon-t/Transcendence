// ------------------------------- IMPORT VIEWS -------------------------------
// A view is a class containing the HTML and JS of a page
import Home from "./views/Home.js";
import NotFound from "./views/NotFound.js";
import Profile from "./views/Profile.js";
import SignIn from "./views/SignIn.js";
import SignUp from "./views/SignUp.js";
import EditProfile from "./views/EditProfile.js";
import Startpage from "./views/Start.js";
import Friends from "./views/Friends.js";
import resetpass from "./views/resetpass.js";
import TournamentSetup from "./views/tournamentSetup.js";
import TournamentMatch from "./views/tournamentMatch.js";
import UserHistory from "./views/UserHistory.js";
import OneVsOneSetup from "./views/1v1Setup.js";
import OneVsOneGame from "./views/1v1Game.js";


// ------------------------------- IMPORT UTILS ---------------------------------
import { updateTexts } from "./utils/languages.js";
import { applySettings } from "./utils/applySettings.js";
import { attachEventListenersToLinks } from "./utils/utils.js";
import game from "./views/game.js";
import selectgame from "./views/selectgame.js";
import tdgame from "./views/tdgame.js";
import tournamentgame from "./views/tournamentgame.js";
//import auth from "./views/auth.js";

// ------------------------------- CONFIGURE GLOBAL VARIABLES -------------------------------
export const BASE_URL = "https://localhost:8443";
export const BIG_TEXT = '20px';
export const DEFAULT_TEXT = '16px';

// Store interval IDs (to be able to clear them later)
export const ids = {};

// Store the current view
let view = null;

// ------------------------------- THE APP STARTS HERE -------------------------------
// When the DOM is loaded, call initialization functions and the router function
document.addEventListener("DOMContentLoaded", async () => {
	await applySettings();
	// Load the view
	router();
});

// ------------------------------- ROUTING -------------------------------
// Array that contains all routes where each route has a path and a view
const routes = [
	{ path: "/home", view: Home },
	{ path: "/profile", view: Profile },
	{ path: "/signin", view: SignIn },
	{ path: "/signup", view: SignUp },
	{ path: "/edit-profile", view: EditProfile },
	{ path: "/", view: Startpage },
	{ path: "/game", view: game},
	{ path: "/selectgame", view: selectgame},
	{ path: "/tdgame", view: tdgame},
	{ path: "/tournamentgame", view: tournamentgame},
	{ path: "/tournamentsetup", view: TournamentSetup },
	{ path: "/tournamentMatch", view: TournamentMatch },
	{ path: "/friends", view: Friends },
	{ path: "/resetpass", view: resetpass },
	{ path: "/match-history", view: UserHistory },
	{ path: "/1v1setup", view: OneVsOneSetup },
	{ path: "/1v1game", view: OneVsOneGame }
	

	// { path: "/auth", view: auth }
];

// Loads the view (HTML and JS) in the div with the id "app" according to the current path
const router = async () => {
	// Test if the current path is in the routes array
	let match = routes.find(route => route.path === location.pathname);

	// If the current path is not in the routes array, set the match to the NotFound view
    if (!match) {
		match = { path: "", view: NotFound };
    }

	// If there's an old view, clean it up
    if (view) {
        view.cleanUpEventListeners();
        view.stopJS();

		const modals = document.querySelectorAll('.modal.show');
		modals.forEach(modal => {
			const modalInstance = bootstrap.Modal.getInstance(modal);
			modalInstance.hide();
		});
    }

	// Create a new instance of the view
    view = new match.view();

	// Load the HTML of the view in the app div
	const appDiv = document.querySelector("#app");
    appDiv.innerHTML = await view.getHtml();

	// Load the JS of the view
	view.loadJS();

	// Overwrite the default behavior of the links to not reload the page
	attachEventListenersToLinks();

	// Initialize with default language
	updateTexts();
};

// ------------------------------- NAVIGATION -------------------------------
// Navigate to a new view
export const navigateTo = url => {
	// Change the URL to the new URL and add a state to the history stack
    history.pushState(null, null, url);

	// Update the view
    router();
};

// Listen for the popstate event (back and forward buttons) and call the router function
window.addEventListener("popstate", router);
