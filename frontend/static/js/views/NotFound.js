import AbstractView from "./AbstractView.js";
import { BASE_URL } from "../index.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - not found");
    }

    async getHtml() {
        return (await fetch(`${BASE_URL}/static/html/notFound.html`)).text();
    }
}
