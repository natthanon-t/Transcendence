import { BASE_URL } from '../index.js';
import { getDisplayName, getMatchDisplayNames } from '../utils/user-display-component.js';
import { getText } from '../utils/languages.js';

export async function userHistory() {
    // Get user ID and username from localStorage
    const userId = localStorage.getItem('user_id');
    const currentUsername = document.getElementById('username-name')?.innerText || 'justintest';
    
    try {
        // Fetch user profile to get full user data including alias
        let currentUserData = null;
        try {
            const profileResponse = await fetch(`${BASE_URL}/api/profile`, {
                credentials: 'include'
            });
            if (profileResponse.ok) {
                const userData = await profileResponse.json();
                currentUserData = userData.user;
            }
        } catch (err) {
            console.warn("Could not fetch user profile:", err);
        }
        
        const response = await fetch(`/api/user_match_history/`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch match history: ${response.status}`);
        }
        
        const matches = await response.json();
        console.log("All matches:", matches);
        
        // Fetch all users to get their aliases for better display
        let allUsers = [];
        try {
            const usersResponse = await fetch(`${BASE_URL}/api/users_list`, {
                credentials: 'include'
            });
            
            if (usersResponse.ok) {
                allUsers = await usersResponse.json();
                console.log("All users data:", allUsers);
            }
        } catch (err) {
            console.warn("Could not fetch users list for aliases:", err);
        }
        
        // Filter matches by type
        const friendlyMatches = matches.filter(match => match.match_type === 'FRIENDLY');
        const tournamentMatches = matches.filter(match => match.match_type === 'TOURNAMENT');
        
        // Get translations for the tabs
        const oneVsOneTranslation = getText('1v1-matches') || '1v1 Matches';
        const tournamentTranslation = getText('tournament-matches') || 'Tournament Matches';
        
        // Create tabbed interface HTML with translated labels
        const historyContainer = document.getElementById('match-history-container');
        historyContainer.innerHTML = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <ul class="nav nav-tabs" id="historyTabs" role="tablist" style="border-bottom: 1px solid rgba(255,255,255,0.3);">
                        <li class="nav-item" role="presentation" style="margin-right: 10px;">
                            <button class="nav-link active custom-tab" id="friendly-tab" data-bs-toggle="tab" data-bs-target="#friendly" type="button" data-translate="1v1-matches">${oneVsOneTranslation}</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link custom-tab" id="tournament-tab" data-bs-toggle="tab" data-bs-target="#tournament" type="button" data-translate="tournament-matches">${tournamentTranslation}</button>
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
        
        // Pass all users data to enhance display names with aliases
        populateFriendlyMatches(friendlyMatches, document.getElementById('friendly-matches-container'), currentUsername, currentUserData, allUsers);
        
        // Populate tournament matches grouped by tournament
        populateTournamentMatches(tournamentMatches, document.getElementById('tournament-matches-container'), currentUsername, currentUserData);
        
    } catch (error) {
        console.error('Error fetching match history:', error);
        const historyContainer = document.getElementById('match-history-container');
        historyContainer.innerHTML = `<div class="text-center text-white">Error loading match history: ${error.message}</div>`;
    }
}

function populateFriendlyMatches(matches, container, currentUsername, currentUserData, allUsers = []) {
    if (matches.length === 0) {
        const noMatchesText = getText('no-1v1-matches') || 'No 1v1 matches found';
        container.innerHTML = `<div class="text-center text-white">${noMatchesText}</div>`;
        return;
    }
    
    container.innerHTML = '';
    
    // Sort by date, newest first
    matches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
    
    // Loop through matches and create display elements
    matches.forEach(match => {
        renderMatchElement(match, container, currentUsername, false, currentUserData, allUsers);
    });
}

function populateTournamentMatches(matches, container, currentUsername, currentUserData) {
    if (matches.length === 0) {
        const noMatchesText = getText('no-tournament-matches') || 'No tournament matches found';
        container.innerHTML = `<div class="text-center text-white">${noMatchesText}</div>`;
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
    
    // Get translation for tournament header
    const tournamentText = getText('tournament') || 'Tournament';
    
    // Render each tournament
    sortedTournaments.forEach(tournament => {
        // Add tournament header
        const tournamentHeader = document.createElement('div');
        tournamentHeader.className = 'col-12 mb-2';
        tournamentHeader.innerHTML = `
            <div class="tournament-header p-2">
                <h5 class="text-white mb-0 text-center">
                    ${tournamentText} #${tournament.id}
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
            renderMatchElement(match, container, currentUsername, true, currentUserData);
        });
    });
}

function getUserAliasFromList(userId, username, allUsers) {
    if (!allUsers || !Array.isArray(allUsers) || allUsers.length === 0) {
        return username;
    }
    
    // Try to find the user in the users list
    const user = allUsers.find(u => 
        (userId && u.id === userId) || 
        (username && u.username === username)
    );
    
    // Return alias if found, otherwise return the original username
    return user && user.alias ? user.alias : username;
}

function renderMatchElement(match, container, currentUsername, isTournament = false, currentUserData = null, allUsers = []) {
    // For tournament matches, use the utility function
    if (isTournament) {
        const displayNames = getMatchDisplayNames(match);
        var player1Name = displayNames.player1;
        var player2Name = displayNames.player2;
        var winnerName = displayNames.winner;
    } else {
        // For friendly matches, handle aliases more explicitly
        // Get player IDs when available
        const player1Id = match.player1;
        const player2Id = match.player2;
        const winnerId = match.winner;
        
        // Get display names with preference for aliases
        var player1Name = match.player1_display_name;
        var player2Name = match.player2_display_name;
        var winnerName = match.winner_display_name;
        
        // Try to enhance with aliases from users list for friendly matches
        if (allUsers && allUsers.length > 0) {
            player1Name = getUserAliasFromList(player1Id, player1Name, allUsers);
            player2Name = getUserAliasFromList(player2Id, player2Name, allUsers);
            winnerName = getUserAliasFromList(winnerId, winnerName, allUsers);
        }
    }
    
    // Get current user's display name (alias or username)
    const currentUserDisplayName = currentUserData && currentUserData.alias ? 
                                  currentUserData.alias : currentUsername;
    
    // More robust user detection - check for multiple identifiers
    const userIsPlayer1 = (currentUserData && match.player1 === currentUserData.id) || 
                         (currentUsername === match.player1_display_name) ||
                         (currentUserDisplayName === player1Name);
                         
    const userIsPlayer2 = (currentUserData && match.player2 === currentUserData.id) || 
                         (currentUsername === match.player2_display_name) ||
                         (currentUserDisplayName === player2Name);
    
    // Determine if user won: either by direct ID comparison or display name match
    const userWon = (userIsPlayer1 && (
                    (currentUserData && match.winner === currentUserData.id) ||
                    winnerName === player1Name
                   )) || 
                   (userIsPlayer2 && (
                    (currentUserData && match.winner === currentUserData.id) ||
                    winnerName === player2Name
                   ));
    
    // Format date
    const matchDate = new Date(match.match_date).toLocaleDateString();
    
    // Create match element
    const matchElement = document.createElement('div');
    matchElement.className = 'col-12 mb-3';
    
    // Get translations for "Won" and "Lost"
    const wonText = getText('won') || 'Won';
    const lostText = getText('lost') || 'Lost';
    
    // Additional info for tournament matches
    let tournamentInfo = '';
    if (isTournament && match.tournament_round) {
        // Get translations for round names
        const firstRoundText = getText('first-round') || 'First Round';
        const semiFinalsText = getText('semi-finals') || 'Semi-Finals';
        const finalsText = getText('finals') || 'Finals';
        const roundText = getText('round') || 'Round';
        
        const roundNames = {
            1: firstRoundText,
            2: semiFinalsText,
            3: finalsText
        };
        const roundName = roundNames[match.tournament_round] || `${roundText} ${match.tournament_round}`;
        tournamentInfo = `<div><small>${roundName}</small></div>`;
    }
    
    // Build match display - note we've removed 'FRIENDLY' from the display
    matchElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center p-3 mb-2 glass">
            <div class="match-info text-white">
                <div class="match-players">${player1Name} vs ${player2Name}</div>
                <div class="match-score">${match.player1_score} - ${match.player2_score}</div>
                <div class="match-details">
                    ${tournamentInfo}
                    <small>${matchDate}</small>
                </div>
            </div>
            <div class="match-result">
                <span class="badge ${userWon ? 'bg-success' : 'bg-danger'}">
                    ${userWon ? wonText : lostText}
                </span>
            </div>
        </div>
    `;
    
    // Add to container
    container.appendChild(matchElement);
}