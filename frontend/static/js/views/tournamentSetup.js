import AbstractView from "./AbstractView.js";
import { getDisplayName } from "../utils/user-display-component.js";
import { getText } from "../utils/languages.js"; // Import getText function

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - Tournament Setup");
        this.players = [];
        this.currentUser = null; // Will store current user data
    }
    
    async getHtml() {
        // Get translations for the dropdown values and button text
        const guestText = getText('guest') || 'Guest';
        const userText = getText('user') || 'User';
        const enterPlayerNameText = getText('enter-player-name') || 'Enter player name';
        const addPlayerBtnText = getText('add') || 'Add';
        const beginTournamentText = getText('begin-tournament') || 'Begin Tournament';
        const editAliasText = getText('edit-alias') || 'Edit Alias';
        const cancelText = getText('cancel') || 'Cancel';
        const saveText = getText('save') || 'Save';
        
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
                                    <option value="guest" data-translate="guest">${guestText}</option>
                                    <option value="user" data-translate="user">${userText}</option>
                                </select>
                                <input type="text" id="player-name" class="form-control" placeholder="${enterPlayerNameText}" data-translate-placeholder="enter-player-name">
                            </div>
                            <button id="add-player" class="btn btn-filled" data-translate="add">${addPlayerBtnText}</button>
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
                                <div class="text-center" data-translate="loading-online-users">Loading online users...</div>
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
                            <button id="start-tournament" class="btn btn-filled" disabled data-translate="begin-tournament">${beginTournamentText}</button>
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
                <div class="modal fade" id="editAliasModal" tabindex="-1" aria-labelledby="editAliasModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content glass-modal-bg text-white">
                            <div class="modal-header border-0">
                                <h5 class="modal-title" id="editAliasModalLabel" data-translate="edit-alias">${editAliasText}</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <input type="text" class="form-control" id="tournament-alias" maxlength="12" placeholder="${enterPlayerNameText}" data-translate-placeholder="enter-alias">
                                    <div id="tournament-alias-error" class="text-danger mt-1"></div>
                                </div>
                            </div>
                            <div class="modal-footer border-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-translate="cancel">${cancelText}</button>
                                <button type="button" class="btn btn-filled" id="save-alias-btn" data-translate="save">${saveText}</button>
                            </div>
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
                    alert(getText('max-players-reached') || "Maximum of 8 players reached");
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
                            alert(getText('player-already-exists') || "A player with this name is already in the tournament");
                            return;
                        }
                        
                        // Verify the user exists in the database
                        const exists = await this.verifyUserExists(name);
                        
                        if (!exists) {
                            alert(getText('user-does-not-exist').replace('{username}', name) || `User "${name}" does not exist`);
                            return;
                        }
                        
                        // Add the verified user
                        this.addPlayer(name, type);
                        playerNameInput.value = '';
                        
                    } catch (error) {
                        console.error("Error verifying user:", error);
                        alert(getText('error-verifying-user') || "Error verifying user. Please try again.");
                    }
                } else {
                    // For guest players, just check for duplicates and add them
                    const isDuplicate = this.players.some(player => 
                        player.name.toLowerCase() === name.toLowerCase()
                    );
                    
                    if (isDuplicate) {
                        alert(getText('player-already-exists') || "A player with this name is already in the tournament");
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
                        alert(getText('min-players-required') || "You need at least 3 players to start a tournament");
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
                    alert(getText('error-creating-tournament') || "Error creating tournament. Please try again.");
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
                
                // Setup alias editing functionality
                this.setupAliasEditing();
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
            console.log("==== USERS API RESPONSE ====");
            console.log(JSON.stringify(users, null, 2));
            console.log("===========================");
            // Get current user's username
            const currentUsername = this.currentUser ? this.currentUser.username : null;
            
            // Filter for online users and exclude current user (already added to tournament)
            const processedUsernames = new Set();
            const onlineUsers = [];
            
            for (const user of users) {
                // Skip if not online, is current user, or already processed
                if (
                    !user.online_status || 
                    user.username === currentUsername || 
                    processedUsernames.has(user.username.toLowerCase())
                ) {
                    continue;
                }
                
                // Add to processed set and online users array
                processedUsernames.add(user.username.toLowerCase());
                onlineUsers.push(user);
            }
            
            if (onlineUsers.length === 0) {
                const noUsersText = getText('no-online-users') || 'No online users available';
                onlineUsersList.innerHTML = `<div class="text-center">${noUsersText}</div>`;
                return;
            }
            
            // Create elements for each online user
            const processingText = getText('processing-online-users') || 'Processing online users...';
            onlineUsersList.innerHTML = `<div class="text-center">${processingText}</div>`;
            
            // Get translations for button text
            const addText = getText('add') || 'Add';
            const addedText = getText('added') || 'Added';
            const onlineText = getText('online') || 'Online';
            
            // Clear the placeholder
            setTimeout(() => {
                onlineUsersList.innerHTML = '';
                
                // Manually create elements for each online user
                onlineUsers.forEach(user => {
                    // Check if user is already in the tournament - case insensitive check
                    const isAlreadyAdded = this.players.some(
                        player => player.type === 'user' && player.name.toLowerCase() === user.username.toLowerCase()
                    );
                    
                    // Get the display name using our utility function
                    const displayName = user.alias || user.username;
                    
                    // Create the user element
                    const userElement = document.createElement('div');
                    userElement.className = 'd-flex justify-content-between align-items-center p-2 mb-2 user-element tabbable';
                    userElement.tabIndex = 0;
                    userElement.dataset.username = user.username;
                    userElement.dataset.displayName = displayName; // Store display name for later use
                    
                    // Create user info display
                    const userInfo = document.createElement('div');
                    userInfo.className = 'd-flex align-items-center';
                    
                    // Create profile pic
                    const profilePic = document.createElement('img');
                    profilePic.src = user.profile_picture_url;
                    profilePic.alt = 'profile picture';
                    profilePic.className = 'profile-pic-list';
                    
                    // Create username text - show displayName instead of username
                    const usernameElem = document.createElement('span');
                    usernameElem.className = 'ms-2';
                    usernameElem.textContent = displayName;
                    
                    // Create online indicator
                    const onlineIndicator = document.createElement('span');
                    onlineIndicator.className = 'ms-2 badge bg-success';
                    onlineIndicator.textContent = onlineText;
                    onlineIndicator.setAttribute('data-translate', 'online');
                    
                    // Assemble user info
                    userInfo.appendChild(profilePic);
                    userInfo.appendChild(usernameElem);
                    userInfo.appendChild(onlineIndicator);
                    
                    // Create add button
                    const addButton = document.createElement('button');
                    addButton.className = 'btn btn-sm btn-filled';
                    addButton.textContent = isAlreadyAdded ? addedText : addText;
                    addButton.setAttribute('data-translate', isAlreadyAdded ? 'added' : 'add');
                    addButton.disabled = isAlreadyAdded;
                    
                    if (!isAlreadyAdded) {
                        addButton.addEventListener('click', () => {
                            console.log(`Adding online user: ${user.username} (${displayName})`);
                            this.addPlayer(user.username, 'user', displayName);
                            addButton.textContent = addedText;
                            addButton.setAttribute('data-translate', 'added');
                            addButton.disabled = true;
                        });
                        
                        // Add keydown event for accessibility
                        userElement.addEventListener('keydown', (event) => {
                            if (event.key === 'Enter') {
                                console.log(`Adding online user via keyboard: ${user.username} (${displayName})`);
                                this.addPlayer(user.username, 'user', displayName);
                                addButton.textContent = addedText;
                                addButton.setAttribute('data-translate', 'added');
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
                    const noUsersText = getText('no-online-users') || 'No online users available';
                    onlineUsersList.innerHTML = `<div class="text-center">${noUsersText}</div>`;
                }
            }, 100);
            
        } catch (error) {
            console.error('Error loading online users:', error);
            const errorText = getText('error-loading-users') || 'Error loading online users';
            onlineUsersList.innerHTML = `<div class="text-center">${errorText}</div>`;
        }
    }
    
    addPlayer(name, type, explicitDisplayName = null) {
        // Check for duplicates across all player types (case insensitive)
        const isDuplicate = this.players.some(player => 
            player.name.toLowerCase() === name.toLowerCase()
        );
        
        if (isDuplicate) {
            const duplicateText = getText('player-already-exists') || "A player with this name is already in the tournament";
            alert(duplicateText);
            return;
        }
    
        // Determine display name
        let displayName = explicitDisplayName;
        
        // If no explicit display name was provided
        if (!displayName) {
            if (type === 'user') {
                // For registered users
                if (this.currentUser && this.currentUser.username === name) {
                    // It's the current user
                    displayName = this.currentUser.alias || name;
                } else {
                    // Try to find user in the online users list
                    const userElem = document.querySelector(`.user-element[data-username="${name}"]`);
                    if (userElem && userElem.dataset.displayName) {
                        displayName = userElem.dataset.displayName;
                    } else {
                        displayName = name;
                    }
                }
            } else {
                // For guest players
                displayName = name;
            }
        }
        
        // Add to players array
        this.players.push({
            name: name,            // Original name/username (for server)
            displayName: displayName, // Display name (for UI)
            type: type
        });
        
        console.log("Players array:", this.players);
        
        // Update UI
        this.updatePlayersList();
        
        // Refresh online users list
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
        
        // Get translations for user and guest labels
        const userText = getText('user') || 'User';
        const guestText = getText('guest') || 'Guest';
        
        // Add each player to the list
        this.players.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'text-white mb-2 d-flex justify-content-between align-items-center';
            
            // Use displayName for UI
            const nameToShow = player.displayName || player.name;
            const typeLabel = player.type === 'user' ? userText : guestText;
            
            li.innerHTML = `
                <span>${nameToShow} (${typeLabel})</span>
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
                
                // Refresh online users list
                this.loadOnlineUsers(document.getElementById('online-users-list'));
                
                const startBtn = document.getElementById('start-tournament');
                if (startBtn) {
                    startBtn.disabled = this.players.length < 3;
                }
            });
        });
    }

    validateAlias(aliasValue) {
        const aliasErrorElem = document.getElementById('alias-error');
        
        // Clear previous error
        aliasErrorElem.innerHTML = '&nbsp;';
        
        // Check if the alias is too long (shouldn't happen due to maxlength but just in case)
        if (aliasValue.length > 12) {
            const tooLongText = getText('alias-too-long') || 'Alias must be 12 characters or less';
            aliasErrorElem.textContent = tooLongText;
            return false;
        }
        
        // Empty alias is allowed (it will default to username)
        return true;
    }

    async updateUserAlias(newAlias) {
        try {
            // Validate alias length
            if (newAlias.length > 12) {
                const tooLongText = getText('alias-too-long') || 'Alias must be 12 characters or less';
                document.getElementById('alias-error').textContent = tooLongText;
                return false;
            }
            
            // Create form data
            const formData = new FormData();
            formData.append('alias', newAlias);
            
            // Send update request
            const response = await fetch('/api/update_user', {
                method: 'PUT',
                body: formData,
                credentials: 'include'
            });
            
            if (!response.ok) {
                const data = await response.json();
                if (data.alias) {
                    document.getElementById('alias-error').textContent = data.alias[0];
                } else {
                    const errorText = getText('error-updating-alias') || 'Error updating alias';
                    document.getElementById('alias-error').textContent = errorText;
                }
                return false;
            }
            
            // Update was successful
            return true;
        } catch (error) {
            console.error('Error updating alias:', error);
            const errorText = getText('error-updating-alias') || 'Error updating alias';
            document.getElementById('alias-error').textContent = errorText;
            return false;
        }
    }
    
    setupAliasEditing() {
        // Find the current user in the players list
        const currentPlayerItem = document.querySelector('#players-list li');
        
        if (!currentPlayerItem) {
            console.error("Current player element not found!");
            return;
        }
        
        // Get translation for Edit Alias button
        const editAliasText = getText('edit-alias') || 'Edit Alias';
        
        // Add edit button to the list item
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-outline-light ms-2';
        editButton.textContent = editAliasText;
        editButton.setAttribute('data-translate', 'edit-alias');
        editButton.style.fontSize = '0.75rem';
        editButton.style.padding = '2px 8px';
        editButton.style.marginLeft = '8px';
        
        // Add button next to the player name
        const nameSpan = currentPlayerItem.querySelector('span');
        nameSpan.appendChild(editButton);
        
        // Set up the edit button click handler
        editButton.addEventListener('click', () => {
            const aliasInput = document.getElementById('tournament-alias');
            const saveButton = document.getElementById('save-alias-btn');
            const errorElement = document.getElementById('tournament-alias-error');
            
            // Clear any previous errors
            errorElement.textContent = '';
            
            // Set the current value in the input
            aliasInput.value = this.currentUser.alias || '';
            
            // Show the modal using Bootstrap's API
            const modal = new bootstrap.Modal(document.getElementById('editAliasModal'));
            modal.show();
            
            // Set up save button handler
            saveButton.onclick = async () => {
                const newAlias = aliasInput.value.trim();
                
                // Simple validation
                if (newAlias.length > 12) {
                    const tooLongText = getText('alias-too-long') || 'Alias must be 12 characters or less';
                    errorElement.textContent = tooLongText;
                    return;
                }
                
                // Update alias via API
                const formData = new FormData();
                formData.append('alias', newAlias);
                
                try {
                    const response = await fetch('/api/update_user', {
                        method: 'PUT',
                        body: formData,
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        const data = await response.json();
                        errorElement.textContent = data.alias ? data.alias[0] : (getText('error-updating-alias') || 'Error updating alias');
                        return;
                    }
                    
                    // Success - update local data
                    this.currentUser.alias = newAlias;
                    this.updateCurrentUserInPlayersList();
                    modal.hide();
                    
                } catch (error) {
                    console.error('Error updating alias:', error);
                    const errorText = getText('error-updating-alias') || 'Error updating alias';
                    errorElement.textContent = errorText;
                }
            };
        });
    }
    
    updateCurrentUserInPlayersList() {
        // Find the current user in the players array
        const currentUserIndex = this.players.findIndex(
            player => player.type === 'user' && player.name === this.currentUser.username
        );
        
        if (currentUserIndex !== -1) {
            // Update their display name
            this.players[currentUserIndex].displayName = this.currentUser.alias || this.currentUser.username;
            
            // Update the UI
            this.updatePlayersList();
        }
    }
    
    stopJS() {
        // Clean up any intervals or event listeners if needed
    }
}