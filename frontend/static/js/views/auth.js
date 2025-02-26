import AbstractView from "./AbstractView.js";
import { auth } from "../scripts/auth.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - auth");
    }

    async getHtml() {
		return (await fetch("static/html/auth.html")).text();
    }

    loadJS() {
      auth();
    }

    stopJS(){
  // No loop in this view
    }
}