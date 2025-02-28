import AbstractView from "./AbstractView.js";
import { userHistory } from "../scripts/userHistory.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - Match History");
    }

    async getHtml() {
        return `
            <div class="full-height d-flex flex-column align-items-center justify-content-center">
                <div class="container glass p-5 m-1">
                    <div class="row justify-content-center mb-2">
                        <div class="col-12 text-center">
                            <p class="text-white h1" animated-letters data-translate="match-history">Match History</p>
                        </div>
                    </div>
                    <div class="row justify-content-center mb-4">
                        <div class="col-12 text-left">
                            <hr class="text-white">
                        </div>
                    </div>
                    
                    <div id="match-history-container" class="row">
                        <div class="text-center text-white">Loading match history...</div>
                    </div>
                </div>
                
            <a role="button" class="return-btn btn btn-lg text-light text-center d-flex align-items-center justify-content-center p-3 mt-5" href="/profile" data-link>
                <img src="static/assets/UI/icons/profile.svg" alt="profile button" id="profile">
            </a>
            </div>
        `;
    }

    async loadJS() {
        await userHistory();
    }

    stopJS() {
        // No loop in this view
    }
}