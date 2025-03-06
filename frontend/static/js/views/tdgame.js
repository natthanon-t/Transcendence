import AbstractView from "./AbstractView.js";
import "../scripts/pong-game.js";
import "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - 3D game");
    }

    async getHtml() {
		const response = await fetch("static/html/tdgame.html");
        return await response.text();
    }
}
