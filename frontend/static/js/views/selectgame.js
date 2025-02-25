import AbstractView from "./AbstractView.js";
// import { home } from "../scripts/home.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - select Game mode");
    }

    async getHtml() {
		const response = await fetch("static/html/selectgame.html");
        return await response.text();
    }
}
