import AbstractView from "./AbstractView.js";
// import { home } from "../scripts/home.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - Tournament game");
    }

    async getHtml() {
		const response = await fetch("static/html/tournamentgame.html");
        return await response.text();
    }
}
