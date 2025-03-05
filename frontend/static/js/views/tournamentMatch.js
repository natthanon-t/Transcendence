import AbstractView from "./AbstractView.js";
import "../components/TournamentPongGame.js";
import { getText } from "../utils/languages.js"; // Import getText function

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        console.log("All Cookies:", document.cookie);  // Log all cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                console.log("Found Cookie:", name, cookieValue); // Log if found
                break;
            }
        }
    }
    console.log("getCookie Result:", name, cookieValue); // Log result
    return cookieValue;
}

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - Tournament Match");
    }
    
    async getHtml() {
        // Get translations for static content
        const tournamentMatchText = getText('tournament-match') || 'Tournament Match';
        const loadingMatchDataText = getText('loading-match-data') || 'Loading match data...';
        const backToTournamentText = getText('back-to-tournament') || 'Back to Tournament';
        const restartMatchText = getText('restart-match') || 'Restart Match';
        const submitResultText = getText('submit-result') || 'Submit Result';
        
        return `
            <div class="full-height d-flex flex-column align-items-center justify-content-center">
                <div id="match-info" class="glass p-3 mb-3 text-white text-center" style="width: 800px;">
                    <h3 data-translate="tournament-match">${tournamentMatchText}</h3>
                    <div id="match-players" class="mb-2" data-translate="loading-match-data">${loadingMatchDataText}</div>
                </div>
                
                <div id="game-container">
                    <!-- Tournament game will be loaded here -->
                </div>
                
                <!-- Buttons Container -->
                <div class="d-flex justify-content-center mt-4 gap-4">
                    <!-- Back to Tournament Button -->
                    <a id="back-btn" role="button" class="btn btn-lg glass text-white d-flex align-items-center justify-content-center" href="#">
                        <img src="static/assets/UI/icons/back-arrow.svg" alt="Back to Tournament" width="24" height="24">
                        <span class="ms-2" data-translate="back-to-tournament">${backToTournamentText}</span>
                    </a>
                    
                    <!-- Restart Match Button -->
                    <a id="restart-btn" role="button" class="btn btn-lg glass text-white d-flex align-items-center justify-content-center">
                        <img src="static/assets/UI/icons/restart.svg" alt="Restart Match" width="24" height="24">
                        <span class="ms-2" data-translate="restart-match">${restartMatchText}</span>
                    </a>
                </div>
                
                <!-- Submit Result Button (completely hidden until needed) -->
                <div id="submit-btn-container" class="mt-4" style="display: none;">
                    <a id="submit-btn" role="button" class="btn btn-lg glass text-white d-flex align-items-center justify-content-center">
                        <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
                        <span class="ms-2" data-translate="submit-result">${submitResultText}</span>
                    </a>
                </div>
            </div>
        `;
    }
    
    loadJS() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.matchId = urlParams.get('matchId');
        this.tournamentId = urlParams.get('tournamentId');
        
        if (!this.matchId) {
            const errorText = getText('no-match-id') || "No match ID provided";
            this.showError(errorText);
            return;
        }
        
        // Load match data
        this.loadMatchData();
        
        // Add event listeners
        document.getElementById('back-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.tournamentId) {
                window.location.href = `/tournamentgame?id=${this.tournamentId}`;
            } else {
                window.location.href = '/selectgame';
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            // Clear the game container
            const gameContainer = document.getElementById('game-container');
            gameContainer.innerHTML = '';
            
            // Create a new tournament game
            this.createTournamentGame();
        });
        
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitMatchResult();
        });
    }
    
    async loadMatchData() {
        try {
            // Fetch match data
            const response = await fetch(`/api/tournament/match/${this.matchId}/`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorText = getText('fetch-match-error') || "Failed to load match data";
                throw new Error(`${errorText}: ${response.status}`);
            }
            
            const data = await response.json();
            this.matchData = data;
            console.log("==== MATCH DATA RESPONSE ====");
            console.log(JSON.stringify(data, null, 2));
            console.log("=============================");
            
            // Update UI
            this.updateMatchInfo(data);
            
            // Create the tournament game
            this.createTournamentGame();
            
        } catch (error) {
            console.error('Error loading match data:', error);
            this.showError(`Error: ${error.message}`);
        }
    }
    
    updateMatchInfo(match) {
        const matchPlayersElement = document.getElementById('match-players');
        
        if (matchPlayersElement) {
            const player1Name = this.getPlayerName(match.player1);
            const player2Name = this.getPlayerName(match.player2);
            
            // Get translations
            const roundText = getText('round') || 'Round';
            const matchText = getText('match') || 'Match';
            const vsText = getText('vs') || 'vs';
            const matchCompletedText = getText('match-completed') || 'This match has already been completed.';
            const resultText = getText('result') || 'Result';
            const winnerText = getText('winner') || 'Winner';
            
            matchPlayersElement.innerHTML = `
                <div class="mb-2">
                    <strong>${roundText} ${match.round_number}</strong> - ${matchText} ${match.match_number + 1}
                </div>
                <div class="d-flex justify-content-center align-items-center gap-3">
                    <span class="h4">${player1Name}</span>
                    <span class="h5">${vsText}</span>
                    <span class="h4">${player2Name}</span>
                </div>
            `;
            
            if (match.completed) {
                matchPlayersElement.innerHTML += `
                    <div class="alert alert-warning mt-2">
                        ${matchCompletedText}
                        <div>${resultText}: ${player1Name} ${match.player1_score} - ${match.player2_score} ${player2Name}</div>
                        <div>${winnerText}: ${this.getPlayerName(match.winner)}</div>
                    </div>
                `;
            }
        }
    }
    
    createTournamentGame() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer || !this.matchData) return;
        
        // Clear any existing content
        gameContainer.innerHTML = '';
        
        // Create a new tournament-pong-game element
        const gameElement = document.createElement('tournament-pong-game');
        
        // Set explicit width and height
        gameElement.style.width = '800px';
        gameElement.style.height = '500px';
        gameElement.style.display = 'block';
        gameElement.style.margin = '0 auto';
        
        // Set match data
        gameElement.matchData = this.matchData;
        
        // Add event listener for when the game ends
        gameElement.addEventListener('gameend', (event) => {
            console.log("Game ended with result:", event.detail);
            // Store the result for submission
            this.gameResult = event.detail;
            
            // Auto-submit after a short delay
            if (event.detail.autoSubmit) {
                const matchPlayersElement = document.getElementById('match-players');
                
                // Get translation
                const autoSubmittingText = getText('auto-submitting') || 'Auto-submitting result...';
                
                if (matchPlayersElement) {
                    matchPlayersElement.innerHTML += `
                        <div class="alert alert-info mt-2">
                            ${autoSubmittingText}
                        </div>
                    `;
                }
                
                setTimeout(() => {
                    this.submitMatchResult(true); // true indicates this is an auto-submission
                }, 2000); // 2-second delay to show the game over message
            } else {
                // Only show the submit button if auto-submit is not enabled
                const submitBtnContainer = document.getElementById('submit-btn-container');
                const submitBtn = document.getElementById('submit-btn');
                
                // Get translation
                const submitResultText = getText('submit-result') || 'Submit Result';
                
                if (submitBtnContainer && submitBtn) {
                    submitBtnContainer.style.display = 'block';
                    submitBtn.innerHTML = `
                        <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
                        <span class="ms-2" data-translate="submit-result">${submitResultText} (${event.detail.player1Score} - ${event.detail.player2Score})</span>
                    `;
                }
            }
        });
        
        // Add the game to the container
        gameContainer.appendChild(gameElement);
        
        // Debug message
        console.log("Tournament game element created and added to container");
    }
    
    getPlayerName(player) {
        if (!player) return getText('unknown') || 'Unknown';
        
        // Simply use the display_name that's already provided by the API
        if (player.display_name) {
            return player.display_name;
        }
        
        // Fallbacks in case display_name isn't available
        return player.username || player.guest_name || (getText('unknown') || 'Unknown');
    }
    
    async submitMatchResult(isAutoSubmit = false) {
        if (!this.matchId || !this.gameResult || !this.matchData) {
            const errorText = getText('no-match-data') || "No match data or game result available";
            this.showError(errorText);
            return;
        }
        
        // Get translations
        const errorSubmittingText = getText('error-submitting') || 'Error submitting match result';
        const autoSubmitFailedText = getText('auto-submit-failed') || 'Auto-submission failed. Please try manual submission.';
        const manualSubmitText = getText('manual-submit') || 'Manual Submit';
        const matchSubmittedText = getText('match-submitted') || 'Match result submitted successfully!';
        
        // If auto-submission fails, show the manual submit button
        const handleSubmissionError = (error) => {
            console.error('Error submitting match result:', error);
            this.showError(`Error: ${error.message}`);
            
            // Only show the manual submit button if this was an auto-submission
            if (isAutoSubmit) {
                const submitBtnContainer = document.getElementById('submit-btn-container');
                const submitBtn = document.getElementById('submit-btn');
                if (submitBtnContainer && submitBtn) {
                    submitBtnContainer.style.display = 'block';
                    submitBtn.innerHTML = `
                        <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
                        <span class="ms-2">${manualSubmitText} (${this.gameResult.player1Score} - ${this.gameResult.player2Score})</span>
                    `;
                    
                    const matchPlayersElement = document.getElementById('match-players');
                    if (matchPlayersElement) {
                        matchPlayersElement.innerHTML += `
                            <div class="alert alert-warning mt-2">
                                ${autoSubmitFailedText}
                            </div>
                        `;
                    }
                }
            }
        };
        
        try {
            // Add debug logging for authentication
            const token = getCookie('jwt') || localStorage.getItem('jwt');
            console.log("Authentication token present:", !!token);
            
            // Show csrftoken in debug
            const csrfToken = getCookie('csrftoken');
            console.log("CSRF token present:", !!csrfToken);

            // Determine winner ID
            let winnerId;
            if (this.gameResult.winner === 1) {
                winnerId = this.matchData.player1.id;
            } else {
                winnerId = this.matchData.player2.id;
            }
            
            // Log the data we're about to send
            const requestData = {
                winner_id: winnerId,
                player1_score: this.gameResult.player1Score,
                player2_score: this.gameResult.player2Score
            };
            console.log("Submitting match result:", requestData);
            
            // Construct the URL
            const url = `/api/tournament/match/${this.matchId}/update/`;
            console.log("Submitting to URL:", url);
            
            // Submit result
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(requestData),
                credentials: 'include'
            });
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                // Get more details about the error
                let errorText = "";
                try {
                    const errorData = await response.json();
                    errorText = JSON.stringify(errorData);
                } catch (e) {
                    try {
                        errorText = await response.text();
                    } catch (e2) {
                        errorText = "Could not read error response";
                    }
                }
                
                console.error(`Response error (${response.status}):`, errorText);
                
                if (response.status === 401) {
                    console.error("Authentication error - trying to refresh session");
                    throw new Error(`Authentication error: ${errorText}`);
                }
                
                throw new Error(`Failed to update match: ${response.status} - ${errorText}`);
            }
            
            // Parse the successful response
            const result = await response.json();
            console.log("Match update result:", result);
            
            // Show success message
            const matchPlayersElement = document.getElementById('match-players');
            if (matchPlayersElement) {
                matchPlayersElement.innerHTML += `
                    <div class="alert alert-success mt-2">
                        ${matchSubmittedText}
                    </div>
                `;
            }
            
            // Hide submit button container
            const submitBtnContainer = document.getElementById('submit-btn-container');
            if (submitBtnContainer) {
                submitBtnContainer.style.display = 'none';
            }
            
            // Redirect after a short delay
            setTimeout(() => {
                if (this.tournamentId) {
                    window.location.href = `/tournamentgame?id=${this.tournamentId}`;
                } else {
                    window.location.href = '/selectgame';
                }
            }, 2000);
            
        } catch (error) {
            handleSubmissionError(error);
        }
    }
    
    showError(message) {
        const matchPlayersElement = document.getElementById('match-players');
        if (matchPlayersElement) {
            // Get translation for Error
            const errorText = getText('error') || 'Error';
            
            matchPlayersElement.innerHTML = `
                <div class="alert alert-danger">
                    ${message}
                </div>
            `;
        }
    }
    
    stopJS() {
        // Clean up any timers or event listeners
    }
}