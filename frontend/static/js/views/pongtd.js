// import AbstractView from "./AbstractView.js";
// // import { home } from "../scripts/home.js";

// export default class extends AbstractView {
//     constructor() {
//         super();
//         this.setTitle("42_group - 3DPong");
//     }

//     async getHtml() {
// 		const response = await fetch("static/html/pong3d.html");
//         return await response.text();
//     }
// }
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - 3DPong");
    }

    async getHtml() {
        const response = await fetch("static/html/pong3d.html");
        const html = await response.text();

        // Load scripts only if the URL is exactly "localhost/gametd"
        if (window.location.pathname === "/pongtd") {
            setTimeout(() => this.loadJS(), 0);
        }

        return html;
    }

    async loadJS() {
        try {
            await this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
            await this.loadScript("/static/html/pong-game.js");
            console.log("All game scripts loaded successfully.");
        } catch (error) {
            console.error("Error loading game scripts:", error);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Prevent duplicate loading
            if (document.querySelector(`script[src="${src}"]`)) {
                console.log(`Script already loaded: ${src}`);
                return resolve();
            }

            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => {
                console.log(`Loaded script: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load script: ${src}`);
                reject();
            };
            document.body.appendChild(script);
        });
    }
}

