import AbstractView from "./AbstractView.js";
// import { home } from "../scripts/home.js";

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
