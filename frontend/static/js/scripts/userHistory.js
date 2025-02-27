import { BASE_URL } from "../index.js";

export async function userHistory() {
    // Get user ID from localStorage (same as profile.js)
    const userId = localStorage.getItem('user_id');
    
    // Fetch user's match history
    try {
        const response = await fetch(`${BASE_URL}/api/user_match_history/`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch match history: ${response.status}`);
        }
        
        const matches = await response.json();
        
        // Get the container element
        const historyContainer = document.getElementById('match-history-container');
        
        if (matches.length === 0) {
            historyContainer.innerHTML = `<div class="text-center text-white">No match history found</div>`;
            return;
        }
        
        // Clear the container
        historyContainer.innerHTML = '';
        
        // Loop through matches and create display elements
        matches.forEach(match => {
            // Get player names using the serialized properties
            const player1Name = match.player1_display_name;
            const player2Name = match.player2_display_name;
            
            // Determine if the current user was player1
            const currentUserIsPlayer1 = match.player1 && match.player1.id === parseInt(userId);
            const userWon = (currentUserIsPlayer1 && match.is_player1_winner) || 
                           (!currentUserIsPlayer1 && !match.is_player1_winner);
            
            // Format date
            const matchDate = new Date(match.match_date).toLocaleDateString();
            
            // Create the match history item element
            const matchElement = document.createElement('div');
            matchElement.className = 'col-12 mb-3';
            
            // Build the match display
            matchElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center p-3 mb-2 glass">
                    <div class="match-info text-white">
                        <div class="match-players">${player1Name} vs ${player2Name}</div>
                        <div class="match-score">${match.player1_score} - ${match.player2_score}</div>
                        <div class="match-details">
                            <small>${match.match_type}</small>
                            <small>${matchDate}</small>
                        </div>
                    </div>
                    <div class="match-result">
                        <span class="badge ${userWon ? 'bg-success' : 'bg-danger'}">
                            ${userWon ? 'Won' : 'Lost'}
                        </span>
                    </div>
                </div>
            `;
            
            // Add to container
            historyContainer.appendChild(matchElement);
        });
    } catch (error) {
        console.error('Error fetching match history:', error);
        const historyContainer = document.getElementById('match-history-container');
        historyContainer.innerHTML = `<div class="text-center text-white">Error loading match history: ${error.message}</div>`;
    }
}