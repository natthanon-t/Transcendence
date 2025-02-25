import AbstractView from "./AbstractView.js";
import { profile } from "../scripts/profile.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - profile");
    }

    async getHtml() {
		return (await fetch("static/html/profile.html")).text();
    }

	async loadJS() {
		await profile();
	}

  stopJS(){
		// No loop in this view
	}

}
