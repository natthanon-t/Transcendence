import { BASE_URL } from '../index.js';

// export async function userHistory() {
//     // Get user ID and username from localStorage
//     const userId = localStorage.getItem('user_id');
//     const currentUsername = document.getElementById('username-name')?.innerText || 'justintest';
    
//     try {
//         const response = await fetch(`/api/user_match_history/`, {
//             credentials: 'include'
//         });
        
//         if (!response.ok) {
//             throw new Error(`Failed to fetch match history: ${response.status}`);
//         }
        
//         const matches = await response.json();
//         console.log("All matches:", matches);
        
//         // Filter matches by type
//         const friendlyMatches = matches.filter(match => match.match_type === 'FRIENDLY');
//         const tournamentMatches = matches.filter(match => match.match_type === 'TOURNAMENT');
        
//         // Create tabbed interface HTML - removing "All Matches" tab
//         const historyContainer = document.getElementById('match-history-container');
//         historyContainer.innerHTML = `
//             <div class="row mb-4">
//                 <div class="col-12 d-flex justify-content-center">
//                     <ul class="nav nav-tabs" id="historyTabs" role="tablist" style="border-bottom: 1px solid rgba(255,255,255,0.3);">
//                         <li class="nav-item" role="presentation" style="margin-right: 10px;">
//                             <button class="nav-link active custom-tab" id="friendly-tab" data-bs-toggle="tab" data-bs-target="#friendly" type="button">1v1 Matches</button>
//                         </li>
//                         <li class="nav-item" role="presentation">
//                             <button class="nav-link custom-tab" id="tournament-tab" data-bs-toggle="tab" data-bs-target="#tournament" type="button">Tournament Matches</button>
//                         </li>
//                     </ul>
//                 </div>
//             </div>
            
//             <style>
//                 .custom-tab {
//                     color: rgba(255,255,255,0.7);
//                     background-color: transparent;
//                     border: none;
//                     padding: 8px 15px;
//                     border-radius: 5px 5px 0 0;
//                 }
//                 .custom-tab.active {
//                     color: white;
//                     background-color: rgba(255,255,255,0.15);
//                     border-bottom: 2px solid #23bf76;
//                     font-weight: bold;
//                 }
//                 .custom-tab:hover:not(.active) {
//                     background-color: rgba(255,255,255,0.05);
//                     color: white;
//                 }
//             </style>
            
//             <div class="tab-content" id="historyTabContent">
//                 <div class="tab-pane fade show active" id="friendly" role="tabpanel">
//                     <div id="friendly-matches-container" class="row"></div>
//                 </div>
//                 <div class="tab-pane fade" id="tournament" role="tabpanel">
//                     <div id="tournament-matches-container" class="row"></div>
//                 </div>
//             </div>
//         `;
        
//         // Initialize tab functionality
//         document.querySelectorAll('#historyTabs button').forEach(button => {
//             button.addEventListener('click', function() {
//                 document.querySelectorAll('#historyTabs button').forEach(btn => {
//                     btn.classList.remove('active');
//                 });
//                 this.classList.add('active');
                
//                 const target = this.getAttribute('data-bs-target').substring(1);
//                 document.querySelectorAll('.tab-pane').forEach(pane => {
//                     pane.classList.remove('show', 'active');
//                 });
//                 document.getElementById(target).classList.add('show', 'active');
//             });
//         });
        
//         // Populate each tab with matches
//         populateMatchHistory(friendlyMatches, document.getElementById('friendly-matches-container'), currentUsername);
//         populateMatchHistory(tournamentMatches, document.getElementById('tournament-matches-container'), currentUsername);
        
//     } catch (error) {
//         console.error('Error fetching match history:', error);
//         const historyContainer = document.getElementById('match-history-container');
//         historyContainer.innerHTML = `<div class="text-center text-white">Error loading match history: ${error.message}</div>`;
//     }
// }

// function populateMatchHistory(matches, container, currentUsername) {
//     if (matches.length === 0) {
//         container.innerHTML = '<div class="text-center text-white">No matches found</div>';
//         return;
//     }
    
//     container.innerHTML = '';
    
//     // Loop through matches and create display elements
//     matches.forEach(match => {
//         console.log(`Match ${match.id}:`, match);
        
//         // Get player names
//         const player1Name = match.player1_display_name;
//         const player2Name = match.player2_display_name;
//         const winnerName = match.winner_display_name;
        
//         // DIRECTLY determine if current user won based on display names
//         const userIsPlayer1 = currentUsername === player1Name;
//         const userIsPlayer2 = currentUsername === player2Name;
//         const userWon = (userIsPlayer1 && winnerName === player1Name) || 
//                         (userIsPlayer2 && winnerName === player2Name);
        
//         console.log(`Current user: ${currentUsername}`);
//         console.log(`Player1: ${player1Name}, Player2: ${player2Name}, Winner: ${winnerName}`);
//         console.log(`User is Player1: ${userIsPlayer1}, User is Player2: ${userIsPlayer2}`);
//         console.log(`User won: ${userWon}`);
        
//         // Format date
//         const matchDate = new Date(match.match_date).toLocaleDateString();
        
//         // Create match element
//         const matchElement = document.createElement('div');
//         matchElement.className = 'col-12 mb-3';
        
//         // Build match display
//         matchElement.innerHTML = `
//             <div class="d-flex justify-content-between align-items-center p-3 mb-2 glass">
//                 <div class="match-info text-white">
//                     <div class="match-players">${player1Name} vs ${player2Name}</div>
//                     <div class="match-score">${match.player1_score} - ${match.player2_score}</div>
//                     <div class="match-details">
//                         <small>${match.match_type}</small>
//                         <small>${matchDate}</small>
//                     </div>
//                 </div>
//                 <div class="match-result">
//                     <span class="badge ${userWon ? 'bg-success' : 'bg-danger'}">
//                         ${userWon ? 'Won' : 'Lost'}
//                     </span>
//                 </div>
//             </div>
//         `;
        
//         // Add to container
//         container.appendChild(matchElement);
//     });
// }

export async function userHistory() {
    // Get user ID and username from localStorage
    const userId = localStorage.getItem('user_id');
    const currentUsername = document.getElementById('username-name')?.innerText || 'justintest';
    
    try {
        const response = await fetch(`/api/user_match_history/`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch match history: ${response.status}`);
        }
        
        const matches = await response.json();
        console.log("All matches:", matches);
        
        // Filter matches by type
        const friendlyMatches = matches.filter(match => match.match_type === 'FRIENDLY');
        const tournamentMatches = matches.filter(match => match.match_type === 'TOURNAMENT');
        
        // Create tabbed interface HTML
        const historyContainer = document.getElementById('match-history-container');
        historyContainer.innerHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <ul class="nav nav-tabs" id="historyTabs" role="tablist" style="border-bottom: 1px solid rgba(255,255,255,0.3);">
                        <li class="nav-item" role="presentation" style="margin-right: 10px;">
                            <button class="nav-link active custom-tab" id="friendly-tab" data-bs-toggle="tab" data-bs-target="#friendly" type="button">1v1 Matches</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-tab" id="tournament-tab" data-bs-toggle="tab" data-bs-target="#tournament" type="button">Tournament Matches</button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <style>
                .custom-tab {
                    color: rgba(255,255,255,0.7);
                    background-color: transparent;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px 5px 0 0;
                }
                .custom-tab.active {
                    color: white;
                    background-color: rgba(255,255,255,0.15);
                    border-bottom: 2px solid #23bf76;
                    font-weight: bold;
                }
                .custom-tab:hover:not(.active) {
                    background-color: rgba(255,255,255,0.05);
                    color: white;
                }
                .tournament-header {
                    background-color: rgba(255,255,255,0.1);
                    border-radius: 5px;
                    margin-bottom: 10px;
                }
            </style>
            
            <div class="tab-content" id="historyTabContent">
                <div class="tab-pane fade show active" id="friendly" role="tabpanel">
                    <div id="friendly-matches-container" class="row"></div>
                </div>
                <div class="tab-pane fade" id="tournament" role="tabpanel">
                    <div id="tournament-matches-container" class="row"></div>
                </div>
            </div>
        `;
        
        // Initialize tab functionality
        document.querySelectorAll('#historyTabs button').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('#historyTabs button').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                const target = this.getAttribute('data-bs-target').substring(1);
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                document.getElementById(target).classList.add('show', 'active');
            });
        });
        
        // Populate friendly matches normally
        populateFriendlyMatches(friendlyMatches, document.getElementById('friendly-matches-container'), currentUsername);
        
        // Populate tournament matches grouped by tournament
        populateTournamentMatches(tournamentMatches, document.getElementById('tournament-matches-container'), currentUsername);
        
    } catch (error) {
        console.error('Error fetching match history:', error);
        const historyContainer = document.getElementById('match-history-container');
        historyContainer.innerHTML = `<div class="text-center text-white">Error loading match history: ${error.message}</div>`;
    }
}

function populateFriendlyMatches(matches, container, currentUsername) {
    if (matches.length === 0) {
        container.innerHTML = '<div class="text-center text-white">No 1v1 matches found</div>';
        return;
    }
    
    container.innerHTML = '';
    
    // Sort by date, newest first
    matches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
    
    // Loop through matches and create display elements
    matches.forEach(match => {
        renderMatchElement(match, container, currentUsername);
    });
}

function populateTournamentMatches(matches, container, currentUsername) {
    if (matches.length === 0) {
        container.innerHTML = '<div class="text-center text-white">No tournament matches found</div>';
        return;
    }
    
    container.innerHTML = '';
    
    // Group tournaments by tournament ID
    const tournamentGroups = {};
    matches.forEach(match => {
        const tournamentId = match.tournament;
        
        if (!tournamentId) return;
        
        if (!tournamentGroups[tournamentId]) {
            tournamentGroups[tournamentId] = {
                id: tournamentId,
                matches: [],
                date: match.match_date
            };
        }
        
        tournamentGroups[tournamentId].matches.push(match);
        
        // Track earliest date for sorting
        if (new Date(match.match_date) < new Date(tournamentGroups[tournamentId].date)) {
            tournamentGroups[tournamentId].date = match.match_date;
        }
    });
    
    // Sort tournaments by date (newest first)
    const sortedTournaments = Object.values(tournamentGroups).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Render each tournament
    sortedTournaments.forEach(tournament => {
        // Add tournament header
        const tournamentHeader = document.createElement('div');
        tournamentHeader.className = 'col-12 mb-2';
        tournamentHeader.innerHTML = `
            <div class="tournament-header p-2">
                <h5 class="text-white mb-0 text-center">
                    Tournament #${tournament.id}
                    <small class="text-white-50">${new Date(tournament.date).toLocaleDateString()}</small>
                </h5>
            </div>
        `;
        container.appendChild(tournamentHeader);
        
        // Sort matches by round (higher rounds first)
        tournament.matches.sort((a, b) => {
            if (a.tournament_round !== b.tournament_round) {
                return b.tournament_round - a.tournament_round; // Finals first
            }
            return 0;
        });
        
        // Add all matches for this tournament
        tournament.matches.forEach(match => {
            renderMatchElement(match, container, currentUsername, true);
        });
    });
}

function renderMatchElement(match, container, currentUsername, isTournament = false) {
    // Get player names
    const player1Name = match.player1_display_name;
    const player2Name = match.player2_display_name;
    const winnerName = match.winner_display_name;
    
    // Determine if current user won
    const userIsPlayer1 = currentUsername === player1Name;
    const userIsPlayer2 = currentUsername === player2Name;
    const userWon = (userIsPlayer1 && winnerName === player1Name) || 
                    (userIsPlayer2 && winnerName === player2Name);
    
    // Format date
    const matchDate = new Date(match.match_date).toLocaleDateString();
    
    // Create match element
    const matchElement = document.createElement('div');
    matchElement.className = 'col-12 mb-3';
    
    // Additional info for tournament matches
    let tournamentInfo = '';
    if (isTournament && match.tournament_round) {
        const roundNames = {
            1: 'First Round',
            2: 'Semi-Finals',
            3: 'Finals'
        };
        const roundName = roundNames[match.tournament_round] || `Round ${match.tournament_round}`;
        tournamentInfo = `<div><small>${roundName}</small></div>`;
    }
    
    // Build match display
    matchElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center p-3 mb-2 glass">
            <div class="match-info text-white">
                <div class="match-players">${player1Name} vs ${player2Name}</div>
                <div class="match-score">${match.player1_score} - ${match.player2_score}</div>
                <div class="match-details">
                    ${tournamentInfo}
                    <small>${isTournament ? '' : 'FRIENDLY'}</small>
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
    container.appendChild(matchElement);
}