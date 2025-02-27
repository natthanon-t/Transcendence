import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - Tournament");
    }
    
    async getHtml() {
        return `
            <div class="full-height d-flex flex-column align-items-center justify-content-center">
                <div id="tournament-bracket-container" class="mb-4" style="width: 100%; max-width: 800px;">
                    <!-- Tournament bracket will be inserted here -->
                </div>

                <div id="match-controls" class="mb-4 glass p-3 text-white text-center" style="width: 100%; max-width: 800px;">
                    <h3>Tournament Controls</h3>
                    <div id="current-match-info">Select a match to play</div>
                    <div class="mt-3">
                        <button id="play-match-btn" class="btn btn-lg btn-filled" disabled>Play Selected Match</button>
                    </div>
                </div>
                
                <div class="mt-3">
                    <a role="button" class="return-btn btn btn-lg text-light text-center d-flex align-items-center justify-content-center p-3" 
                       href="/selectgame" data-link>
                        <img src="static/assets/UI/icons/game.svg" alt="Back to Games" id="gamemenu">
                    </a>
                </div>
            </div>
        `;
    }
    
	loadJS() {
		// Get tournament ID from URL parameter
		this.tournamentId = new URLSearchParams(window.location.search).get('id');
		
		// Check if tournament ID exists
		if (!this.tournamentId) {
			this.showError("No tournament ID provided. Please select a tournament first.");
			return;
		}
		
		// Initialize the tournament
		this.initTournament();
	}
    
	async initTournament() {
		try {
			// Clear any existing refresh timer to prevent stacking timers
			if (this.refreshTimer) {
				clearTimeout(this.refreshTimer);
				this.refreshTimer = null;
			}
			
			// Double-check tournament ID
			if (!this.tournamentId) {
				throw new Error("No tournament ID provided");
			}
			
			// Fetch tournament matches
			const matchesResponse = await fetch(`/api/tournament/${this.tournamentId}/matches/`, {
				credentials: 'include'
			});
			
			if (!matchesResponse.ok) {
				throw new Error(`Failed to fetch tournament matches: ${matchesResponse.status}`);
			}
			
			const matchesData = await matchesResponse.json();
			console.log('Tournament matches:', matchesData);
			
			// Store matches as a class property and process byes
			this.matches = this.processMatchesWithByes(matchesData.matches || []);
			
			// Calculate player count and store it
			this.playerCount = this.calculateTotalPlayers(this.matches);
			
			// Check if we have any matches
			if (this.matches.length === 0) {
				this.showError("No matches found for this tournament");
				return;
			}
			
			// Create the bracket with the fetched data
			this.createBracket(this.matches);
			
			// Update match controls
			this.updateMatchControls(this.matches);
		} catch (error) {
			console.error('Error initializing tournament:', error);
			this.showError(`Error: ${error.message}`);
		}
	}

	processMatchesWithByes(matches) {
		if (!matches || matches.length === 0) return [];
		
		// DO NOT automatically mark matches as completed just because they have a bye
		// Instead, we'll handle this in the UI and progression logic
		
		// Only process first-round byes to auto-advance players
		// For later rounds, wait for previous matches to complete
		matches.forEach(match => {
			const isFirstRound = match.round_number === 1;
			
			// Only in the first round, auto-complete bye matches
			if (isFirstRound && match.player1 && !match.player2) {
				match.completed = true;
				match.winner = match.player1;
				match.player1_score = 1;
				match.player2_score = 0;
			}
		});
		
		return matches;
	}
    
	createBracket(matches) {
		// Group matches by round
		const rounds = {};
		matches.forEach(match => {
			if (!rounds[match.round_number]) {
				rounds[match.round_number] = [];
			}
			rounds[match.round_number].push(match);
		});
		
		// Find the maximum round number
		const maxRound = Math.max(...Object.keys(rounds).map(Number));
		
		// Create the bracket structure - only for rounds we have
		const bracketContainer = document.getElementById('tournament-bracket-container');
		bracketContainer.innerHTML = '';
		
		for (let roundNum = 1; roundNum <= maxRound; roundNum++) {
			const roundEl = document.createElement('div');
			roundEl.className = 'tournament-round';
			
			// Add title based on round position
			const title = document.createElement('h3');
			title.innerText = this.getRoundName(roundNum, maxRound);
			roundEl.appendChild(title);
			
			// Add actual matches in this round
			const roundMatches = rounds[roundNum] || [];
			roundMatches.sort((a, b) => a.match_number - b.match_number);
			
			roundMatches.forEach(match => {
				const matchEl = this.createMatchElement(match);
				roundEl.appendChild(matchEl);
			});
			
			bracketContainer.appendChild(roundEl);
		}
	}

	calculateTotalPlayers(matches) {
		// Handle case where matches is undefined
		if (!matches || !Array.isArray(matches)) {
			return 0;
		}
		
		// Find all unique player IDs across matches
		const playerIds = new Set();
		
		matches.forEach(match => {
			if (match.player1 && match.player1.id) {
				playerIds.add(match.player1.id);
			}
			if (match.player2 && match.player2.id) {
				playerIds.add(match.player2.id);
			}
		});
		
		return playerIds.size;
	}

	// Create placeholder for matches that don't exist yet
	createPlaceholderMatch(roundNum, matchNum) {
		const matchContainer = document.createElement('div');
		matchContainer.className = 'match-container mb-4';
		
		const matchElement = document.createElement('div');
		matchElement.className = 'match glass p-2 placeholder-match';
		
		// Add match number
		const matchNumber = document.createElement('div');
		matchNumber.className = 'match-number text-white-50 small text-end';
		matchNumber.textContent = `#${matchNum + 1}`;
		matchElement.appendChild(matchNumber);
		
		// Add placeholder players
		const player1Element = document.createElement('div');
		player1Element.className = 'player p-2 text-muted';
		player1Element.textContent = 'TBD';
		
		const player2Element = document.createElement('div');
		player2Element.className = 'player p-2 text-muted';
		player2Element.textContent = 'TBD';
		
		matchElement.appendChild(player1Element);
		matchElement.appendChild(player2Element);
		
		// Add to container
		matchContainer.appendChild(matchElement);
		return matchContainer;
	}
    
    // organizeMatchesByRound(matches) {
    //     const rounds = {};
        
    //     matches.forEach(match => {
    //         if (!rounds[match.round_number]) {
    //             rounds[match.round_number] = [];
    //         }
    //         rounds[match.round_number].push(match);
    //     });
        
    //     // Sort matches within each round
    //     Object.keys(rounds).forEach(roundNum => {
    //         rounds[roundNum].sort((a, b) => a.match_number - b.match_number);
    //     });
        
    //     return rounds;
    // }
    
	// Updated to take a number as second parameter
	getRoundName(roundNumber, maxRound) {
		// Use the stored player count instead of recalculating it
		const playerCount = this.playerCount || 0;
		
		if (roundNumber === maxRound) {
			return 'Final';
		} else if (roundNumber === maxRound - 1) {
			return 'Semi-Finals';
		} else if (roundNumber === 1) {
			// For small tournaments (3-4 players), call it "First Round" instead of "Quarter-Finals"
			return playerCount <= 4 ? 'First Round' : 'Round 1';
		} else {
			return `Round ${roundNumber}`;
		}
	}
    
	createMatchElement(match) {
		const matchContainer = document.createElement('div');
		matchContainer.className = 'match-container mb-4';
		matchContainer.dataset.matchId = match.id;
		
		const matchElement = document.createElement('div');
		matchElement.className = 'match glass p-2';
		matchElement.style.cursor = 'pointer';
		
		// Add match number
		const matchNumber = document.createElement('div');
		matchNumber.className = 'match-number text-white-50 small text-end';
		matchNumber.textContent = `#${match.match_number + 1}`;
		matchElement.appendChild(matchNumber);
		
		// Add player 1
		let player1Element;
		if (match.player1) {
			player1Element = this.createPlayerElement(match.player1, match.completed && match.winner?.id === match.player1?.id);
		} else {
			player1Element = document.createElement('div');
			player1Element.className = 'player p-2 text-muted';
			player1Element.textContent = 'TBD';
		}
		matchElement.appendChild(player1Element);
		
		// Add player 2 or bye
		let player2Element;
		if (match.player2) {
			player2Element = this.createPlayerElement(match.player2, match.completed && match.winner?.id === match.player2?.id);
		} else {
			player2Element = document.createElement('div');
			player2Element.className = 'player p-2 text-muted';
			
			// Only show "Bye" for first round matches
			// For other rounds, show "TBD" if players aren't determined yet
			if (match.player1 && match.round_number === 1) {
				player2Element.textContent = 'Bye';
			} else {
				player2Element.textContent = 'TBD';
			}
		}
		matchElement.appendChild(player2Element);
		
		// Show score if match is completed
		if (match.completed) {
			const scoreElement = document.createElement('div');
			scoreElement.className = 'score text-white text-center';
			
			// Handle the case of a bye differently
			if (match.player1 && !match.player2) {
				// We don't want to show "Automatic Win" for matches with TBD players
				if (match.round_number === 1) {
					scoreElement.textContent = 'Bye'; // First round bye
				} else {
					scoreElement.textContent = match.player1_score + ' - ' + match.player2_score;
				}
			} else {
				scoreElement.textContent = match.player1_score + ' - ' + match.player2_score;
			}
			
			matchElement.appendChild(scoreElement);
		}
		
		// Add click handler to select match
		matchElement.addEventListener('click', () => {
			this.selectMatch(match);
		});
		
		// Add to container
		matchContainer.appendChild(matchElement);
		return matchContainer;
	}
    
    createPlayerElement(player, isWinner) {
        const element = document.createElement('div');
        element.className = `player p-2 ${isWinner ? 'winner' : ''}`;
        
        if (player) {
            element.textContent = player.user?.username || player.guest_name || 'Unknown';
        } else {
            element.textContent = 'TBD';
            element.classList.add('text-muted');
        }
        
        return element;
    }
    
	updateMatchControls(matches) {
		const matchInfoElement = document.getElementById('current-match-info');
		const playButton = document.getElementById('play-match-btn');
		
		if (!matchInfoElement || !playButton) return;
		
		// Clear any existing refresh timer to prevent multiple timers
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
		
		// Find the final round number
		const maxRound = Math.max(...matches.map(m => m.round_number));
		
		// Get all matches in the final round
		const finalMatches = matches.filter(m => m.round_number === maxRound);
		
		// First, check if tournament is complete (final match is completed with a winner)
		const completedFinal = finalMatches.find(match => match.completed && match.winner);
		
		if (completedFinal) {
			// Tournament is complete - show winner
			const winnerName = completedFinal.winner.user?.username || completedFinal.winner.guest_name || "Unknown";
			
			matchInfoElement.innerHTML = `
				<div class="alert alert-success">
					<strong>Tournament Complete!</strong><br>
					Winner: ${winnerName}
				</div>
			`;
			playButton.disabled = true;
			return;
		}
		
		// Find matches that are ready to be played (both players assigned and not completed)
		const playableMatches = matches.filter(match => 
			!match.completed && match.player1 && match.player2
		);
		
		// Find matches that are waiting for players (not completed, missing at least one player)
		const waitingMatches = matches.filter(match => 
			!match.completed && (!match.player1 || !match.player2)
		);
		
		// Find matches that need advancement tracking (completed but may have next round implications)
		const completedMatchesNeedingAdvancement = matches.filter(match => 
			match.completed && match.winner && 
			waitingMatches.some(wm => wm.round_number > match.round_number)
		);
		
		// Track refresh attempts for state transitions
		if (!this.refreshAttempts) {
			this.refreshAttempts = 0;
		}
		
		if (playableMatches.length > 0) {
			// Reset refresh attempt counter when we have playable matches
			this.refreshAttempts = 0;
			
			// Sort to prioritize earlier rounds
			playableMatches.sort((a, b) => a.round_number - b.round_number);
			
			const nextMatch = playableMatches[0];
			const player1Name = nextMatch.player1.user?.username || nextMatch.player1.guest_name || "Unknown";
			const player2Name = nextMatch.player2.user?.username || nextMatch.player2.guest_name || "Unknown";
			
			matchInfoElement.innerHTML = `
				<div class="alert alert-info">
					<strong>Next Match:</strong> ${player1Name} vs ${player2Name}
					<br><small>Round ${nextMatch.round_number}, Match #${nextMatch.match_number + 1}</small>
				</div>
			`;
			
			playButton.disabled = false;
			
			// Remove any existing event listeners to prevent duplicates
			const newButton = playButton.cloneNode(true);
			playButton.parentNode.replaceChild(newButton, playButton);
			
			// Add click event listener
			newButton.addEventListener('click', () => {
				window.location.href = `/tournamentMatch?matchId=${nextMatch.id}&tournamentId=${this.tournamentId}`;
			});
		} else if (completedMatchesNeedingAdvancement.length > 0 && waitingMatches.length > 0 && this.refreshAttempts < 3) {
			// We need to advance winners to next rounds but limit refresh attempts
			this.refreshAttempts++;
			
			matchInfoElement.innerHTML = `
				<div class="alert alert-warning">
					<strong>Advancing Winners</strong><br>
					Please wait while winners are advanced to the next round
				</div>
			`;
			
			playButton.disabled = true;
			
			// Schedule a refresh but with a limit to prevent infinite loops
			console.log(`Scheduling refresh attempt ${this.refreshAttempts}/3...`);
			this.refreshTimer = setTimeout(() => this.initTournament(), 2000);
		} else if (waitingMatches.length > 0) {
			// If we've tried refreshing several times but matches still need advancement,
			// it's better to show a more stable UI state and let the user refresh manually
			
			if (this.refreshAttempts >= 3) {
				console.log("Maximum refresh attempts reached. Stopping auto-refresh.");
			}
			
			// Check if any matches in the next round have player1 set but not player2
			const matchesWithOnlyPlayer1 = waitingMatches.filter(match => match.player1 && !match.player2);
			
			if (matchesWithOnlyPlayer1.length > 0) {
				// This is likely a final match with bye player waiting for an opponent
				const match = matchesWithOnlyPlayer1[0];
				const playerName = match.player1.user?.username || match.player1.guest_name || "Unknown";
				
				matchInfoElement.innerHTML = `
					<div class="alert alert-info">
						<strong>Waiting for Opponent</strong><br>
						${playerName} is waiting for an opponent
					</div>
				`;
			} else {
				matchInfoElement.innerHTML = `
					<div class="alert alert-warning">
						<strong>Tournament in Progress</strong><br>
						Waiting for matches to be completed
					</div>
				`;
			}
			
			playButton.disabled = true;
		} else {
			// No playable matches or waiting matches - tournament in unknown state
			matchInfoElement.innerHTML = `
				<div class="alert alert-secondary">
					<strong>Tournament Status</strong><br>
					No matches ready to be played
				</div>
			`;
			
			playButton.disabled = true;
		}
	}
    
	selectMatch(match) {
		const playButton = document.getElementById('play-match-btn');
		const matchInfoElement = document.getElementById('current-match-info');
		
		// If match is already completed, show the result
		if (match.completed) {
			if (match.player1 && match.player2) {
				// Regular completed match
				const player1Name = match.player1.user?.username || match.player1.guest_name || "Unknown";
				const player2Name = match.player2.user?.username || match.player2.guest_name || "Unknown";
				const winnerName = match.winner.user?.username || match.winner.guest_name || "Unknown";
				
				matchInfoElement.innerHTML = `
					<div class="alert alert-secondary">
						<strong>Completed Match:</strong> ${player1Name} vs ${player2Name}<br>
						Result: ${match.player1_score} - ${match.player2_score}<br>
						Winner: ${winnerName}
					</div>
				`;
			} else if (match.player1 && !match.player2 && match.round_number === 1) {
				// First round bye
				const playerName = match.player1.user?.username || match.player1.guest_name || "Unknown";
				
				matchInfoElement.innerHTML = `
					<div class="alert alert-secondary">
						<strong>Bye Match:</strong><br>
						${playerName} advances to next round automatically
					</div>
				`;
			} else {
				// Other completed match (shouldn't happen)
				matchInfoElement.innerHTML = `
					<div class="alert alert-secondary">
						<strong>Completed Match</strong><br>
						This match has been completed
					</div>
				`;
			}
			
			playButton.disabled = true;
			return;
		}
		
		// If both players aren't set yet, disable the play button
		if (!match.player1 || !match.player2) {
			matchInfoElement.innerHTML = `
				<div class="alert alert-warning">
					<strong>Match Not Ready</strong><br>
					This match is waiting for players to be determined
				</div>
			`;
			
			playButton.disabled = true;
			return;
		}
		
		// Store the selected match
		this.selectedMatch = match;
		
		const player1Name = match.player1.user?.username || match.player1.guest_name || "Unknown";
		const player2Name = match.player2.user?.username || match.player2.guest_name || "Unknown";
		
		matchInfoElement.innerHTML = `
			<div class="alert alert-primary">
				<strong>Selected Match:</strong> ${player1Name} vs ${player2Name}
			</div>
		`;
		
		// Enable the play button
		playButton.disabled = false;
		
		// Update the play button click handler
		playButton.onclick = () => {
			window.location.href = `/tournamentMatch?matchId=${match.id}&tournamentId=${this.tournamentId}`;
		};
	}
    
	showError(message) {
		const bracketContainer = document.getElementById('tournament-bracket-container');
		const matchControls = document.getElementById('match-controls');
		
		if (bracketContainer) {
			bracketContainer.innerHTML = `
				<div class="alert alert-danger p-4">
					<h4>Error</h4>
					<p>${message}</p>
					<div class="mt-3">
						<a href="/selectgame" class="btn btn-primary" data-link>Return to Game Selection</a>
					</div>
				</div>
			`;
		}
		
		if (matchControls) {
			matchControls.style.display = 'none';
		}
	}
    
    stopJS() {
        // Clean up any timers or event listeners
    }
}