import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - Tournament Setup");
        this.players = [];
        this.currentUser = null; // Will store current user data
    }
    
    async getHtml() {
        // Same HTML structure as your previous code
        return `
            <div class="full-height d-flex flex-column align-items-center justify-content-center">
                <div class="container container-tournament p-5 mb-5">
                    <div class="row justify-content-center mb-2">
                        <div class="col-12 text-center">
                            <p class="text-white h1" animated-letters data-translate="tournament-setup">Tournament Setup</p>
                        </div>
                    </div>
                    <div class="row justify-content-center mb-4">
                        <div class="col-12 text-left">
                            <hr class="text-white">
                        </div>
                    </div>
                    
                    <!-- Player Input Section -->
                    <div class="row justify-content-center mb-3">
                        <div class="col-md-6 text-center text-white glass p-3">
                            <p class="h4" data-translate="add-player">Add Player</p>
                            <div class="mb-3">
                                <select id="player-type" class="form-select mb-2">
                                    <option value="guest">Guest</option>
                                    <option value="user">User</option>
                                </select>
                                <input type="text" id="player-name" class="form-control" placeholder="Enter player name">
                            </div>
                            <button id="add-player" class="btn btn-filled">Add Player</button>
                        </div>
                    </div>
                    
                    <!-- Online Users Section -->
                    <div class="row justify-content-center mb-3">
                        <div class="col-md-6 text-center text-white glass p-3">
                            <p class="h4" data-translate="online-users">Online Users</p>
                            <div class="col-12 px-3">
                                <hr class="text-white">
                            </div>
                            <div class="p-2 pt-1" id="online-users-list">
                                <!-- Online users will be populated here -->
                                <div class="text-center">Loading online users...</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Current Players Section -->
                    <div class="row justify-content-center mb-3">
                        <div class="col-md-6 text-center text-white glass p-3">
                            <p class="h4" data-translate="tournament-players">Tournament Players</p>
                            <div class="col-12 px-3">
                                <hr class="text-white">
                            </div>
                            <ul id="players-list" class="list-unstyled mt-3">
                                <!-- Players will be populated here -->
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Tournament Controls -->
                    <div class="row justify-content-center mt-4">
                        <div class="col-md-6 d-flex justify-content-center">
                            <button id="start-tournament" class="btn btn-filled" disabled>Begin Tournament</button>
                        </div>
                    </div>
                    
                    <!-- Return to Game Selection Button -->
                    <div class="row justify-content-center">
                        <div class="col-md-6 d-flex justify-content-center">
                            <a role="button" class="return-btn btn btn-lg text-light text-center d-flex align-items-center justify-content-center p-3 mt-5" href="/selectgame" data-link>
                                <img src="static/assets/UI/icons/game.svg" alt="menugmae Button" id="gamememnu">
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    loadJS() {
        // Call the afterRender method to set up event listeners
        this.afterRender();
    }
    
    async afterRender() {
        console.log("Tournament setup view rendered");
        
        // Get all required DOM elements
        const addPlayerBtn = document.getElementById('add-player');
        const playersList = document.getElementById('players-list');
        const startTournamentBtn = document.getElementById('start-tournament');
        const playerNameInput = document.getElementById('player-name');
        const playerTypeSelect = document.getElementById('player-type');
        const onlineUsersList = document.getElementById('online-users-list');
        
        // First, get current user profile
        await this.getCurrentUser();
        
        // Set initial state of start button
        if (startTournamentBtn) {
            startTournamentBtn.disabled = this.players.length < 3;
        }
        
        // Load online users
        this.loadOnlineUsers(onlineUsersList);
        
        // No need to handle the cancel button as we've replaced it with a direct link
        
        // Add player to the tournament
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', async () => {
                console.log("Add button clicked!");
                const name = playerNameInput.value.trim();
                const type = playerTypeSelect.value;
                
                if (!name) {
                    return; // Don't add empty names
                }
                
                if (this.players.length >= 8) {
                    console.log("Cannot add player. Max players reached.");
                    alert("Maximum of 8 players reached");
                    return;
                }
                
                // If adding a registered user, verify they exist
                if (type === 'user') {
                    try {
                        // First check if any player (user or guest) already has this name
                        const isDuplicate = this.players.some(player => 
                            player.name.toLowerCase() === name.toLowerCase()
                        );
                        
                        if (isDuplicate) {
                            alert("A player with this name is already in the tournament");
                            return;
                        }
                        
                        // Verify the user exists in the database
                        const exists = await this.verifyUserExists(name);
                        
                        if (!exists) {
                            alert(`User "${name}" does not exist`);
                            return;
                        }
                        
                        // Add the verified user
                        this.addPlayer(name, type);
                        playerNameInput.value = '';
                        
                    } catch (error) {
                        console.error("Error verifying user:", error);
                        alert("Error verifying user. Please try again.");
                    }
                } else {
                    // For guest players, just check for duplicates and add them
                    const isDuplicate = this.players.some(player => 
                        player.name.toLowerCase() === name.toLowerCase()
                    );
                    
                    if (isDuplicate) {
                        alert("A player with this name is already in the tournament");
                        return;
                    }
                    
                    this.addPlayer(name, type);
                    playerNameInput.value = '';
                }
            });
        }
        
        // Start tournament button
        if (startTournamentBtn) {
            startTournamentBtn.addEventListener('click', async () => {
                try {
                    console.log("Begin tournament clicked");
                    
                    if (this.players.length < 3) {
                        alert("You need at least 3 players to start a tournament");
                        return;
                    }
                    
                    const formattedPlayers = this.players.map(player => {
                        if (player.type === 'user') {
                            return {
                                type: 'user',
                                username: player.name
                            };
                        } else {
                            return {
                                type: 'guest',
                                name: player.name
                            };
                        }
                    });
                    
                    console.log("Sending tournament data:", formattedPlayers);
                    
                    const response = await fetch('/api/tournament/create/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ players: formattedPlayers }),
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        const text = await response.text();
                        console.error('Failed to create tournament:', text);
                        throw new Error(`Failed to create tournament: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log("Tournament created successfully:", data);
                    
                    // Navigate to the tournament management page
                    window.location.href = `/tournamentgame?id=${data.tournament_id}`;
                } catch (error) {
                    console.error('Error creating tournament:', error);
                    alert("Error creating tournament. Please try again.");
                }
            });
        }
    }

    async getCurrentUser() {
        try {
            const response = await fetch('/api/profile', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch current user');
            }
            
            const data = await response.json();
            this.currentUser = data.user;
            
            // Add current user to the players list automatically if they have an account
            if (this.currentUser) {
                // Determine display name - use alias if present, otherwise username
                const displayName = this.currentUser.alias || this.currentUser.username;
                console.log(`Adding current user automatically: ${displayName}`);
                
                // Add current user to players list
                this.addPlayer(this.currentUser.username, 'user');
            }
            
        } catch (error) {
            console.error('Error fetching current user:', error);
            // Continue without adding the user automatically if there's an error
        }
    }

    async verifyUserExists(username) {
        try {
            // First try using a dedicated endpoint if it exists
            try {
                const response = await fetch(`/api/check_user_exists?username=${encodeURIComponent(username)}`, {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return data.exists;
                }
            } catch (e) {
                console.log("No dedicated endpoint for user verification, falling back to users list");
            }
            
            // Fall back to checking the full users list
            const response = await fetch('/api/users_list', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch users list');
            }
            
            const users = await response.json();
            
            // Case insensitive check for the username
            return users.some(user => 
                user.username.toLowerCase() === username.toLowerCase()
            );
            
        } catch (error) {
            console.error('Error verifying user:', error);
            throw error;
        }
    }
    
    async loadOnlineUsers(onlineUsersList) {
        try {
            // Clear the list
            onlineUsersList.innerHTML = '';
            
            // Fetch all users
            const response = await fetch('/api/users_list', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            
            const users = await response.json();
            
            // Debug: Log all users to inspect the data
            console.log("All users from API:", users);
            
            // Get current user's username
            const currentUsername = this.currentUser ? this.currentUser.username : null;
            console.log("Current username:", currentUsername);
            
            // Filter for online users and exclude current user (already added to tournament)
            // Store usernames we've already processed to avoid duplicates
            const processedUsernames = new Set();
            const onlineUsers = [];
            
            for (const user of users) {
                // Debug the user object
                console.log(`Processing user: ${user.username}, online: ${user.online_status}`);
                
                // Skip if not online, is current user, or already processed
                if (
                    !user.online_status || 
                    user.username === currentUsername || 
                    processedUsernames.has(user.username.toLowerCase())
                ) {
                    console.log(`Skipping user: ${user.username}`);
                    continue;
                }
                
                // Add to processed set and online users array
                processedUsernames.add(user.username.toLowerCase());
                onlineUsers.push(user);
                console.log(`Added to online users: ${user.username}`);
            }
            
            console.log(`Found ${onlineUsers.length} unique online users after filtering`);
            
            if (onlineUsers.length === 0) {
                onlineUsersList.innerHTML = '<div class="text-center">No online users available</div>';
                return;
            }
            
            // Create elements for each online user
            onlineUsersList.innerHTML = '<div class="text-center">Processing online users...</div>';
            
            // Clear the placeholder
            setTimeout(() => {
                onlineUsersList.innerHTML = '';
                
                // Manually create elements for each online user
                onlineUsers.forEach(user => {
                    // Debug the user being added to UI
                    console.log(`Adding UI element for user: ${user.username}`);
                    
                    // Check if user is already in the tournament - case insensitive check
                    const isAlreadyAdded = this.players.some(
                        player => player.type === 'user' && player.name.toLowerCase() === user.username.toLowerCase()
                    );
                    
                    // Create the user element
                    const userElement = document.createElement('div');
                    userElement.className = 'd-flex justify-content-between align-items-center p-2 mb-2 user-element tabbable';
                    userElement.tabIndex = 0;
                    userElement.dataset.username = user.username; // Add data attribute for debugging
                    
                    // Create user info display
                    const userInfo = document.createElement('div');
                    userInfo.className = 'd-flex align-items-center';
                    
                    // Create profile pic
                    const profilePic = document.createElement('img');
                    profilePic.src = user.profile_picture_url;
                    profilePic.alt = 'profile picture';
                    profilePic.className = 'profile-pic-list';
                    
                    // Determine display name - show alias if present, otherwise username
                    const displayName = user.alias || user.username;
                    
                    // Create username text
                    const username = document.createElement('span');
                    username.className = 'ms-2';
                    username.textContent = displayName;
                    
                    // Create online indicator
                    const onlineIndicator = document.createElement('span');
                    onlineIndicator.className = 'ms-2 badge bg-success';
                    onlineIndicator.textContent = 'Online';
                    
                    // Assemble user info
                    userInfo.appendChild(profilePic);
                    userInfo.appendChild(username);
                    userInfo.appendChild(onlineIndicator);
                    
                    // Create add button
                    const addButton = document.createElement('button');
                    addButton.className = 'btn btn-sm btn-filled';
                    addButton.textContent = isAlreadyAdded ? 'Added' : 'Add';
                    addButton.disabled = isAlreadyAdded;
                    
                    if (!isAlreadyAdded) {
                        addButton.addEventListener('click', () => {
                            console.log(`Adding online user: ${user.username}`);
                            this.addPlayer(user.username, 'user');
                            addButton.textContent = 'Added';
                            addButton.disabled = true;
                        });
                        
                        // Add keydown event for accessibility
                        userElement.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                console.log(`Adding online user via keyboard: ${user.username}`);
                                this.addPlayer(user.username, 'user');
                                addButton.textContent = 'Added';
                                addButton.disabled = true;
                            }
                        });
                    }
                    
                    // Assemble final element
                    userElement.appendChild(userInfo);
                    userElement.appendChild(addButton);
                    
                    // Add to the list
                    onlineUsersList.appendChild(userElement);
                });
                
                // If no elements were added, show a message
                if (onlineUsersList.children.length === 0) {
                    onlineUsersList.innerHTML = '<div class="text-center">No online users available</div>';
                }
                
                console.log(`Added ${onlineUsersList.children.length} user elements to the UI`);
            }, 100);
            
        } catch (error) {
            console.error('Error loading online users:', error);
            onlineUsersList.innerHTML = '<div class="text-center">Error loading online users</div>';
        }
    }
    
    addPlayer(name, type) {
        // Check for duplicates across all player types (case insensitive)
        const isDuplicate = this.players.some(player => 
            player.name.toLowerCase() === name.toLowerCase()
        );
        
        if (isDuplicate) {
            alert("A player with this name is already in the tournament");
            return;
        }

        // If this is the current user, check if they have an alias to display
        let displayName = name;
        if (type === 'user' && this.currentUser && this.currentUser.username === name && this.currentUser.alias) {
            displayName = this.currentUser.alias;
        }
        
        // Add to players array with original name (for server) and display name (for UI)
        this.players.push({
            name: name,         // Original name/username (sent to server)
            displayName: displayName, // Display name (for UI only)
            type: type
        });
        
        console.log("Players array:", this.players);
        
        // Update UI
        this.updatePlayersList();
        
        // Refresh online users list to update "Added" status
        this.loadOnlineUsers(document.getElementById('online-users-list'));
        
        // Update start button state
        const startTournamentBtn = document.getElementById('start-tournament');
        if (startTournamentBtn) {
            startTournamentBtn.disabled = this.players.length < 3;
        }
    }
    
    updatePlayersList() {
        const playersList = document.getElementById('players-list');
        
        if (!playersList) {
            console.error("Players list element not found!");
            return;
        }
        
        // Clear the current list
        playersList.innerHTML = '';
        
        // Add each player to the list
        this.players.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'text-white mb-2 d-flex justify-content-between align-items-center';
            
            // Use displayName for UI if available
            const nameToShow = player.displayName || player.name;
            
            li.innerHTML = `
                <span>${nameToShow} (${player.type === 'user' ? 'User' : 'Guest'})</span>
                <button class="btn btn-sm btn-filled remove-player" data-index="${index}">
                    <img src="static/assets/UI/icons/minus.svg" alt="Remove" width="20" height="20">
                </button>
            `;
            
            playersList.appendChild(li);
            
            // Add remove functionality
            const removeBtn = li.querySelector('.remove-player');
            removeBtn.addEventListener('click', () => {
                console.log(`Removing player at index ${index}`);
                this.players.splice(index, 1);
                this.updatePlayersList();
                
                // Refresh online users list to update "Added" status
                this.loadOnlineUsers(document.getElementById('online-users-list'));
                
                const startBtn = document.getElementById('start-tournament');
                if (startBtn) {
                    startBtn.disabled = this.players.length < 3;
                }
            });
        });
    }
    
    stopJS() {
        // Clean up any intervals or event listeners if needed
    }
}