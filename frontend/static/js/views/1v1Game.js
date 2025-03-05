// // static/js/views/1v1Game.js
// import AbstractView from "./AbstractView.js";
// import "../components/TournamentPongGame.js";
// import { BASE_URL } from "../index.js";

// function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');
//         for (let i = 0; i < cookies.length; i++) {
//             const cookie = cookies[i].trim();
//             if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }
//     return cookieValue;
// }

// export default class extends AbstractView {
//     constructor() {
//         super();
//         this.setTitle("42_group - 1 vs 1");
//     }
    
//     async getHtml() {
//         return `
//             <div class="full-height d-flex flex-column align-items-center justify-content-center">
//                 <div id="match-info" class="glass p-3 mb-3 text-white text-center" style="width: 800px;">
//                     <h3>1 vs 1 Match</h3>
//                     <div id="match-players" class="mb-2">
//                         <div class="d-flex justify-content-center align-items-center gap-3">
//                             <span class="h4" id="player1-name">Player 1</span>
//                             <span class="h5">vs</span>
//                             <span class="h4" id="player2-name">Player 2</span>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div id="game-container">
//                     <!-- Game will be loaded here -->
//                 </div>
                
//                 <div class="d-flex justify-content-center mt-4 gap-4">
//                     <button id="back-btn" class="btn btn-lg btn-filled">
//                         <img src="static/assets/UI/icons/back-arrow.svg" alt="Back" width="24" height="24">
//                         <span class="ms-2">Back</span>
//                     </button>
                    
//                     <button id="restart-btn" class="btn btn-lg btn-filled">
//                         <img src="static/assets/UI/icons/restart.svg" alt="Restart" width="24" height="24">
//                         <span class="ms-2">Restart Match</span>
//                     </button>
                    
//                     <button id="submit-btn" class="btn btn-lg btn-filled" style="display: none;">
//                         <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
//                         <span class="ms-2">Submit Result</span>
//                     </button>
//                 </div>
//             </div>
//         `;
//     }
    
//     loadJS() {
//         // Load game setup from sessionStorage
//         const gameSetupJson = sessionStorage.getItem('1v1GameSetup');
//         if (!gameSetupJson) {
//             this.showError("No game setup found. Please return to the setup page.");
//             return;
//         }
        
//         this.gameSetup = JSON.parse(gameSetupJson);
        
//         // Update player names in the UI
//         this.updatePlayerNames();
        
//         // Create the game
//         this.createGame();
        
//         // Add event listeners
//         document.getElementById('back-btn').addEventListener('click', () => {
//             window.location.href = '/1v1setup';
//         });
        
//         document.getElementById('restart-btn').addEventListener('click', () => {
//             // Clear the game container
//             const gameContainer = document.getElementById('game-container');
//             gameContainer.innerHTML = '';
            
//             // Create a new game
//             this.createGame();
//         });
        
//         document.getElementById('submit-btn').addEventListener('click', () => {
//             this.submitMatchResult();
//         });
//     }
    
//     updatePlayerNames() {
//         const player1NameEl = document.getElementById('player1-name');
//         const player2NameEl = document.getElementById('player2-name');
        
//         // Set player 1 name
//         if (this.gameSetup.player1.type === 'guest') {
//             player1NameEl.textContent = this.gameSetup.player1.name;
//         } else {
//             player1NameEl.textContent = this.gameSetup.player1.username || 'You';
//             this.currentUser = {
//                 username: this.gameSetup.player1.username,
//                 id: this.gameSetup.player1.id
//             };
//         }
        
//         // Set player 2 name
//         if (this.gameSetup.player2.type === 'guest') {
//             player2NameEl.textContent = this.gameSetup.player2.name;
//         } else {
//             player2NameEl.textContent = this.gameSetup.player2.username;
//         }
//     }
    
//     createGame() {
//         const gameContainer = document.getElementById('game-container');
//         if (!gameContainer || !this.gameSetup) return;
        
//         // Clear any existing content
//         gameContainer.innerHTML = '';
        
//         // Create a new tournament-pong-game element
//         const gameElement = document.createElement('tournament-pong-game');
        
//         // Set explicit width and height
//         gameElement.style.width = '800px';
//         gameElement.style.height = '500px';
//         gameElement.style.display = 'block';
//         gameElement.style.margin = '0 auto';
        
//         // Set player names
//         const player1Name = this.gameSetup.player1.type === 'guest' ? 
//             this.gameSetup.player1.name : 
//             (this.gameSetup.player1.username || 'You');
            
//         const player2Name = this.gameSetup.player2.type === 'guest' ? 
//             this.gameSetup.player2.name : 
//             this.gameSetup.player2.username;
        
//         gameElement.player1Name = player1Name;
//         gameElement.player2Name = player2Name;
        
//         // Set win score
//         gameElement.winScore = this.gameSetup.winScore;
        
//         // Add event listener for when the game ends
//         gameElement.addEventListener('gameend', (event) => {
//             console.log("Game ended with result:", event.detail);
//             // Store the result for submission
//             this.gameResult = event.detail;
            
//             // Show the submit button
//             const submitBtn = document.getElementById('submit-btn');
//             if (submitBtn) {
//                 submitBtn.style.display = 'inline-flex';
//                 submitBtn.innerHTML = `
//                     <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
//                     <span class="ms-2">Submit Result (${event.detail.player1Score} - ${event.detail.player2Score})</span>
//                 `;
//             }
            
//             // Auto-submit after a short delay
//             if (event.detail.autoSubmit) {
//                 const matchPlayersElement = document.getElementById('match-players');
//                 if (matchPlayersElement) {
//                     matchPlayersElement.innerHTML += `
//                         <div class="alert alert-info mt-2">
//                             Auto-submitting result...
//                         </div>
//                     `;
//                 }
                
//                 setTimeout(() => {
//                     this.submitMatchResult();
//                 }, 2000); // 2-second delay to show the game over message
//             }
//         });
        
//         // Add the game to the container
//         gameContainer.appendChild(gameElement);
        
//         console.log("1v1 game element created with win score:", this.gameSetup.winScore);
//     }
    
//     async submitMatchResult() {
//         if (!this.gameResult) {
//             this.showError("No game result available");
//             return;
//         }
        
//         try {
//             // Prepare match data
//             const matchData = {
//                 match_type: 'FRIENDLY',
//                 player1_score: this.gameResult.player1Score,
//                 player2_score: this.gameResult.player2Score
//             };
            
//             // Set player IDs or guest names
//             if (this.gameSetup.player1.type === 'user' && this.currentUser) {
//                 matchData.player1_id = this.currentUser.id;
//             } else {
//                 matchData.player1_guest_name = this.gameSetup.player1.name;
//             }
            
//             if (this.gameSetup.player2.type === 'user') {
//                 // Try to find the user ID by username
//                 try {
//                     const usersResponse = await fetch(`${BASE_URL}/api/users_list`);
                    
//                     if (usersResponse.status === 200) {
//                         const users = await usersResponse.json();
//                         const targetUser = users.find(u => u.username === this.gameSetup.player2.username);
//                         if (targetUser && targetUser.id) {
//                             matchData.player2_id = targetUser.id;
//                         } else {
//                             matchData.player2_guest_name = this.gameSetup.player2.username;
//                         }
//                     } else {
//                         matchData.player2_guest_name = this.gameSetup.player2.username;
//                     }
//                 } catch (error) {
//                     console.error('Error fetching user data:', error);
//                     matchData.player2_guest_name = this.gameSetup.player2.username;
//                 }
//             } else {
//                 matchData.player2_guest_name = this.gameSetup.player2.name;
//             }
            
//             // Set winner
//             if (this.gameResult.winner === 1) {
//                 if (this.gameSetup.player1.type === 'user' && this.currentUser) {
//                     matchData.winner_id = this.currentUser.id;
//                 } else {
//                     matchData.winner_guest_name = this.gameSetup.player1.name;
//                 }
//             } else {
//                 if (this.gameSetup.player2.type === 'user' && matchData.player2_id) {
//                     matchData.winner_id = matchData.player2_id;
//                 } else {
//                     matchData.winner_guest_name = matchData.player2_guest_name;
//                 }
//             }
            
//             console.log("Submitting match data:", matchData);
            
//             // Submit the result
//             const response = await fetch(`${BASE_URL}/api/record_match/`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRFToken': getCookie('csrftoken')
//                 },
//                 body: JSON.stringify(matchData),
//                 credentials: 'include'
//             });
            
//             if (!response.ok) {
//                 let errorText = "";
//                 try {
//                     const errorData = await response.json();
//                     errorText = JSON.stringify(errorData);
//                 } catch (e) {
//                     try {
//                         errorText = await response.text();
//                     } catch (e2) {
//                         errorText = "Could not read error response";
//                     }
//                 }
                
//                 throw new Error(`Failed to record match: ${errorText}`);
//             }
            
//             // Show success message
//             const matchPlayersElement = document.getElementById('match-players');
//             if (matchPlayersElement) {
//                 matchPlayersElement.innerHTML += `
//                     <div class="alert alert-success mt-2">
//                         Match result recorded successfully!
//                     </div>
//                 `;
//             }
            
//             // Disable submit button
//             document.getElementById('submit-btn').disabled = true;
            
//             // Redirect after a short delay
//             setTimeout(() => {
//                 window.location.href = '/selectgame';
//             }, 2000);
            
//         } catch (error) {
//             console.error('Error submitting match result:', error);
//             this.showError(`Error: ${error.message}`);
//         }
//     }
    
//     showError(message) {
//         const matchPlayersElement = document.getElementById('match-players');
//         if (matchPlayersElement) {
//             matchPlayersElement.innerHTML = `
//                 <div class="alert alert-danger">
//                     ${message}
//                 </div>
//             `;
//         }
//     }
    
//     stopJS() {
//         // Clean up timers or event listeners
//     }
// }

// static/js/views/1v1Game.js
import AbstractView from "./AbstractView.js";
import "../components/TournamentPongGame.js";
import { BASE_URL } from "../index.js";
import { getText } from "../utils/languages.js"; // Import getText function

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - 1 vs 1");
    }
    
    async getHtml() {
        // Get translations for static content
        const oneVsOneMatchText = getText('1v1-match') || '1 vs 1 Match';
        const player1Text = getText('player-1') || 'Player 1';
        const vsText = getText('vs') || 'vs';
        const player2Text = getText('player-2') || 'Player 2';
        const backText = getText('back') || 'Back';
        const restartMatchText = getText('restart-match') || 'Restart Match';
        const submitResultText = getText('submit-result') || 'Submit Result';
        
        return `
            <div class="full-height d-flex flex-column align-items-center justify-content-center">
                <div id="match-info" class="glass p-3 mb-3 text-white text-center" style="width: 800px;">
                    <h3 data-translate="1v1-match">${oneVsOneMatchText}</h3>
                    <div id="match-players" class="mb-2">
                        <div class="d-flex justify-content-center align-items-center gap-3">
                            <span class="h4" id="player1-name">${player1Text}</span>
                            <span class="h5" data-translate="vs">${vsText}</span>
                            <span class="h4" id="player2-name">${player2Text}</span>
                        </div>
                    </div>
                </div>
                
                <div id="game-container">
                    <!-- Game will be loaded here -->
                </div>
                
                <div class="d-flex justify-content-center mt-4 gap-4">
                    <button id="back-btn" class="btn btn-lg btn-filled">
                        <img src="static/assets/UI/icons/back-arrow.svg" alt="Back" width="24" height="24">
                        <span class="ms-2" data-translate="back">${backText}</span>
                    </button>
                    
                    <button id="restart-btn" class="btn btn-lg btn-filled">
                        <img src="static/assets/UI/icons/restart.svg" alt="Restart" width="24" height="24">
                        <span class="ms-2" data-translate="restart-match">${restartMatchText}</span>
                    </button>
                    
                    <button id="submit-btn" class="btn btn-lg btn-filled" style="display: none;">
                        <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
                        <span class="ms-2" data-translate="submit-result">${submitResultText}</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    loadJS() {
        // Get translation for error message
        const noGameSetupText = getText('no-game-setup') || "No game setup found. Please return to the setup page.";
        
        // Load game setup from sessionStorage
        const gameSetupJson = sessionStorage.getItem('1v1GameSetup');
        if (!gameSetupJson) {
            this.showError(noGameSetupText);
            return;
        }
        
        this.gameSetup = JSON.parse(gameSetupJson);
        
        // Update player names in the UI
        this.updatePlayerNames();
        
        // Create the game
        this.createGame();
        
        // Add event listeners
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = '/1v1setup';
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            // Clear the game container
            const gameContainer = document.getElementById('game-container');
            gameContainer.innerHTML = '';
            
            // Create a new game
            this.createGame();
        });
        
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitMatchResult();
        });
    }
    
    updatePlayerNames() {
        const player1NameEl = document.getElementById('player1-name');
        const player2NameEl = document.getElementById('player2-name');
        
        // Get translation for "You"
        const youText = getText('you') || 'You';
        
        // Set player 1 name
        if (this.gameSetup.player1.type === 'guest') {
            player1NameEl.textContent = this.gameSetup.player1.name;
        } else {
            player1NameEl.textContent = this.gameSetup.player1.username || youText;
            this.currentUser = {
                username: this.gameSetup.player1.username,
                id: this.gameSetup.player1.id
            };
        }
        
        // Set player 2 name
        if (this.gameSetup.player2.type === 'guest') {
            player2NameEl.textContent = this.gameSetup.player2.name;
        } else {
            player2NameEl.textContent = this.gameSetup.player2.username;
        }
    }
    
    createGame() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer || !this.gameSetup) return;
        
        // Clear any existing content
        gameContainer.innerHTML = '';
        
        // Create a new tournament-pong-game element
        const gameElement = document.createElement('tournament-pong-game');
        
        // Set explicit width and height
        gameElement.style.width = '800px';
        gameElement.style.height = '500px';
        gameElement.style.display = 'block';
        gameElement.style.margin = '0 auto';
        
        // Get translation for "You"
        const youText = getText('you') || 'You';
        
        // Set player names
        const player1Name = this.gameSetup.player1.type === 'guest' ? 
            this.gameSetup.player1.name : 
            (this.gameSetup.player1.username || youText);
            
        const player2Name = this.gameSetup.player2.type === 'guest' ? 
            this.gameSetup.player2.name : 
            this.gameSetup.player2.username;
        
        gameElement.player1Name = player1Name;
        gameElement.player2Name = player2Name;
        
        // Set win score
        gameElement.winScore = this.gameSetup.winScore;
        
        // Add event listener for when the game ends
        gameElement.addEventListener('gameend', (event) => {
            console.log("Game ended with result:", event.detail);
            // Store the result for submission
            this.gameResult = event.detail;
            
            // Get translation for submit result
            const submitResultText = getText('submit-result') || 'Submit Result';
            
            // Show the submit button
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.style.display = 'inline-flex';
                submitBtn.innerHTML = `
                    <img src="static/assets/UI/icons/profile.svg" alt="Submit Result" width="24" height="24">
                    <span class="ms-2">${submitResultText} (${event.detail.player1Score} - ${event.detail.player2Score})</span>
                `;
            }
            
            // Auto-submit after a short delay
            if (event.detail.autoSubmit) {
                const matchPlayersElement = document.getElementById('match-players');
                
                // Get translation for auto-submitting message
                const autoSubmittingText = getText('auto-submitting') || 'Auto-submitting result...';
                
                if (matchPlayersElement) {
                    matchPlayersElement.innerHTML += `
                        <div class="alert alert-info mt-2">
                            ${autoSubmittingText}
                        </div>
                    `;
                }
                
                setTimeout(() => {
                    this.submitMatchResult();
                }, 2000); // 2-second delay to show the game over message
            }
        });
        
        // Add the game to the container
        gameContainer.appendChild(gameElement);
        
        console.log("1v1 game element created with win score:", this.gameSetup.winScore);
    }
    
    async submitMatchResult() {
        // Get translation for error message
        const noGameResultText = getText('no-game-result') || "No game result available";
        
        if (!this.gameResult) {
            this.showError(noGameResultText);
            return;
        }
        
        try {
            // Prepare match data
            const matchData = {
                match_type: 'FRIENDLY',
                player1_score: this.gameResult.player1Score,
                player2_score: this.gameResult.player2Score
            };
            
            // Set player IDs or guest names
            if (this.gameSetup.player1.type === 'user' && this.currentUser) {
                matchData.player1_id = this.currentUser.id;
            } else {
                matchData.player1_guest_name = this.gameSetup.player1.name;
            }
            
            if (this.gameSetup.player2.type === 'user') {
                // Try to find the user ID by username
                try {
                    const usersResponse = await fetch(`${BASE_URL}/api/users_list`);
                    
                    if (usersResponse.status === 200) {
                        const users = await usersResponse.json();
                        const targetUser = users.find(u => u.username === this.gameSetup.player2.username);
                        if (targetUser && targetUser.id) {
                            matchData.player2_id = targetUser.id;
                        } else {
                            matchData.player2_guest_name = this.gameSetup.player2.username;
                        }
                    } else {
                        matchData.player2_guest_name = this.gameSetup.player2.username;
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    matchData.player2_guest_name = this.gameSetup.player2.username;
                }
            } else {
                matchData.player2_guest_name = this.gameSetup.player2.name;
            }
            
            // Set winner
            if (this.gameResult.winner === 1) {
                if (this.gameSetup.player1.type === 'user' && this.currentUser) {
                    matchData.winner_id = this.currentUser.id;
                } else {
                    matchData.winner_guest_name = this.gameSetup.player1.name;
                }
            } else {
                if (this.gameSetup.player2.type === 'user' && matchData.player2_id) {
                    matchData.winner_id = matchData.player2_id;
                } else {
                    matchData.winner_guest_name = matchData.player2_guest_name;
                }
            }
            
            console.log("Submitting match data:", matchData);
            
            // Submit the result
            const response = await fetch(`${BASE_URL}/api/record_match/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(matchData),
                credentials: 'include'
            });
            
            if (!response.ok) {
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
                
                throw new Error(`Failed to record match: ${errorText}`);
            }
            
            // Get translation for success message
            const matchRecordedText = getText('match-submitted') || 'Match result recorded successfully!';
            
            // Show success message
            const matchPlayersElement = document.getElementById('match-players');
            if (matchPlayersElement) {
                matchPlayersElement.innerHTML += `
                    <div class="alert alert-success mt-2">
                        ${matchRecordedText}
                    </div>
                `;
            }
            
            // Disable submit button
            document.getElementById('submit-btn').disabled = true;
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/selectgame';
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting match result:', error);
            this.showError(`Error: ${error.message}`);
        }
    }
    
    showError(message) {
        const matchPlayersElement = document.getElementById('match-players');
        if (matchPlayersElement) {
            // Get translation for error heading
            const errorText = getText('error') || 'Error';
            
            matchPlayersElement.innerHTML = `
                <div class="alert alert-danger">
                    ${message}
                </div>
            `;
        }
    }
    
    stopJS() {
        // Clean up timers or event listeners
    }
}