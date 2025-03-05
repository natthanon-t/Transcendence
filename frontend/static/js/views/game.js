import AbstractView from "./AbstractView.js";
import "../scripts/game.js";
// import { home } from "../scripts/home.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - home");
    }

    async getHtml() {
		const response = await fetch("static/html/game.html");
        return await response.text();
    }
}
