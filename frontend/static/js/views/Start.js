import AbstractView from "./AbstractView.js";
import { start } from "../scripts/start.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - StartPage");
    }

    async getHtml() {
        return (await fetch("static/html/start.html")).text();
    }

	loadJS() {
		start();
	}

    stopJS(){
		// No loop in this view
	}

}
