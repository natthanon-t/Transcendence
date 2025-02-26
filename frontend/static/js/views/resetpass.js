import AbstractView from "./AbstractView.js";
import { resetPassword } from "../scripts/resetpass.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - reset Pass");
    }

    async getHtml() {
        return (await fetch("static/html/resetpass.html")).text();
    }

    loadJS() {
        resetPassword();
    }

    stopJS(){
		// No loop in this view
	}

}
