import AbstractView from "./AbstractView.js";
import { BASE_URL } from "../index.js";
import { getText } from "../utils/languages.js"; // Import getText function

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - 1 vs 1 Setup");
        this.currentUser = null; // Will store current user data
    }
    
    async getHtml() {
        // Get translations for static content
        const player1YouText = getText('player1-you') || 'Player 1 (You)';
        const player2Text = getText('player2') || 'Player 2';
        const selectFriendText = getText('select-friend') || 'Select Friend';
        const guestPlayerText = getText('guest-player') || 'Guest Player';
        const enterGuestNameText = getText('enter-guest-name') || 'Enter guest name';
        const gameSettingsText = getText('game-settings') || 'Game Settings';
        const pointsToWinText = getText('points-to-win') || 'Points to Win (1-10)';
        const startGameText = getText('start-game') || 'Start Game';
        const selectFriendOptionText = getText('select-a-friend') || 'Select a friend';
        const editAliasText = getText('edit-alias') || 'Edit Alias';
        const cancelText = getText('cancel') || 'Cancel';
        const saveText = getText('save') || 'Save';
        const enterPlayerNameText = getText('enter-player-name') || 'Enter player name';
        
        return `
		<div class="full-height d-flex flex-column align-items-center justify-content-center">
			<div class="container container-tournament p-5 mb-5">
				<div class="row justify-content-center mb-2">
					<div class="col-12 text-center">
						<p class="text-white h1" animated-letters data-translate="1v1-setup">1vs1 Setup</p>
					</div>
				</div>
				<div class="row justify-content-center mb-4">
					<div class="col-12 text-left">
						<hr class="text-white">
					</div>
				</div>
            
            <div class="glass p-4 mb-4" style="max-width: 600px; width: 100%;">
                <div class="mb-4">
                    <h5 class="text-white" data-translate="player1-you">${player1YouText}</h5>
                    <div id="player1Info" class="card bg-dark text-white p-3 mb-3">
                        <div class="d-flex align-items-center">
                            <div id="player1Avatar" class="me-3" style="width: 40px; height: 40px; border-radius: 50%; background-color: #444; overflow: hidden;">
                                <!-- User avatar will be loaded here -->
                            </div>
                            <div class="d-flex align-items-center">
                                <div id="player1Username" class="fw-bold" style="color: #000; font-size: 16px;">Loading...</div>
                                <button id="editAliasButton" class="btn btn-sm btn-outline-light ms-2" style="font-size: 0.75rem; padding: 2px 8px; display: none;" data-translate="edit-alias">${editAliasText}</button>
                            </div>
                        </div>
                    </div>
                </div>
                    
                <div class="mb-4">
                    <h5 class="text-white" data-translate="player2">${player2Text}</h5>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="player2Type" id="player2User" value="user">
                        <label class="form-check-label text-white" for="player2User" data-translate="select-friend">
                            ${selectFriendText}
                        </label>
                    </div>
                    <div id="player2UserSelect" class="mt-2 d-none">
                        <select class="form-select" id="player2Username">
                            <option value="" selected disabled data-translate="select-a-friend">${selectFriendOptionText}</option>
                            <!-- Friends will be loaded here -->
                        </select>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="player2Type" id="player2Guest" value="guest" checked>
                        <label class="form-check-label text-white" for="player2Guest" data-translate="guest-player">
                            ${guestPlayerText}
                        </label>
                    </div>
                    <div id="player2GuestInput" class="mt-2">
                        <input type="text" class="form-control" id="player2GuestName" placeholder="${enterGuestNameText}" data-translate-placeholder="enter-guest-name" maxlength="15">
                    </div>
                </div>
                    
                <div class="mb-4">
                    <h5 class="text-white" data-translate="game-settings">${gameSettingsText}</h5>
                    <div class="form-group">
                        <label class="text-white" for="winScore" data-translate="points-to-win">${pointsToWinText}</label>
                        <input type="number" class="form-control" id="winScore" min="1" max="10" value="5">
                    </div>
                </div>
                
                <!-- Start Game Button (like the Begin Tournament button) -->
                <div class="d-flex justify-content-center mt-4">
                    <button type="button" id="startGameBtn" class="btn btn-filled" data-translate="start-game">
                        ${startGameText}
                    </button>
                </div>
            </div>
            
            <!-- Return to Game Selection Button -->
            <a role="button" class="return-btn btn btn-lg text-light text-center d-flex align-items-center justify-content-center p-3 mt-5" href="/selectgame" data-link>
                <img src="static/assets/UI/icons/game.svg" alt="menugmae Button" id="gamememnu">
            </a>
        </div>
        
        <!-- Edit Alias Modal -->
        <div class="modal fade" id="editAliasModal" tabindex="-1" aria-labelledby="editAliasModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content glass-modal-bg text-white">
                    <div class="modal-header border-0">
                        <h5 class="modal-title" id="editAliasModalLabel" data-translate="edit-alias">${editAliasText}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="player-alias" maxlength="12" placeholder="${enterPlayerNameText}" data-translate-placeholder="enter-alias">
                            <div id="player-alias-error" class="text-danger mt-1"></div>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-translate="cancel">${cancelText}</button>
                        <button type="button" class="btn btn-filled" id="save-alias-btn" data-translate="save">${saveText}</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    
    loadJS() {
        // Load current user info
        this.loadCurrentUser();
        
        // Toggle visibility of player2 user select and guest input
        document.querySelectorAll('input[name="player2Type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                document.getElementById('player2UserSelect').classList.toggle('d-none', radio.value !== 'user');
                document.getElementById('player2GuestInput').classList.toggle('d-none', radio.value !== 'guest');
            });
        });
        
        // Load friends list if logged in
        this.loadFriendsList();
        
        // Set up the start game button
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Set up alias editing button
        const editAliasButton = document.getElementById('editAliasButton');
        if (editAliasButton) {
            editAliasButton.addEventListener('click', () => {
                this.openAliasEditModal();
            });
        }
        
        // Set up save alias button
        const saveAliasButton = document.getElementById('save-alias-btn');
        if (saveAliasButton) {
            saveAliasButton.addEventListener('click', () => {
                this.saveAlias();
            });
        }
    }
    
    async loadCurrentUser() {
        try {
            const response = await fetch(`${BASE_URL}/api/profile`);
            
            if (response.status === 200) {
                const data = await response.json();
                this.currentUser = data.user;
                
                console.log("User data:", this.currentUser);
                
                // Update UI with user info - ensure username is displayed with contrasting colors
                const usernameElement = document.getElementById('player1Username');
                if (usernameElement) {
                    const youText = getText('you') || 'You';
                    
                    // Use alias if available, otherwise use username
                    const displayName = this.currentUser.alias || this.currentUser.username;
                    usernameElement.textContent = displayName;
                    
                    // Force styling to ensure visibility
                    usernameElement.style.color = "#000"; // Black text
                    usernameElement.style.backgroundColor = "transparent";
                    usernameElement.style.padding = "2px 0";
                    usernameElement.style.fontSize = "16px";
                    usernameElement.style.fontWeight = "bold";
                    usernameElement.style.display = "block";
                    
                    // Show edit alias button
                    const editAliasButton = document.getElementById('editAliasButton');
                    if (editAliasButton) {
                        editAliasButton.style.display = 'inline-block';
                    }
                }
                
                // Load avatar (same as before)
                try {
                    const avatarResponse = await fetch(`${BASE_URL}/api/user_avatar`);
                    if (avatarResponse.status === 200) {
                        const blob = await avatarResponse.blob();
                        const url = URL.createObjectURL(blob);
                        const avatarContainer = document.getElementById('player1Avatar');
                        avatarContainer.innerHTML = `<img src="${url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else {
                        const avatarContainer = document.getElementById('player1Avatar');
                        avatarContainer.innerHTML = `<img src="static/assets/images/profile_pic_transparent.png" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
                    }
                } catch (error) {
                    console.error('Error loading avatar:', error);
                }
            } else {
                window.location.href = '/signin';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            window.location.href = '/signin';
        }
    }

    async loadFriendsList() {
        try {
            const response = await fetch(`${BASE_URL}/api/friends_list`);
            
            if (response.status === 200) {
                const friends = await response.json();
                const selectElement = document.getElementById('player2Username');
                
                // Clear existing options except the first one
                while (selectElement.options.length > 1) {
                    selectElement.remove(1);
                }
                
                // Add friends as options
                if (friends && friends.length > 0) {
                    // Attempt to fetch full user details to get aliases
                    try {
                        const usersResponse = await fetch(`${BASE_URL}/api/users_list`);
                        if (usersResponse.status === 200) {
                            const users = await usersResponse.json();
                            
                            // Create a map of username to alias for quick lookup
                            const userAliasMap = {};
                            users.forEach(user => {
                                if (user.username) {
                                    userAliasMap[user.username.toLowerCase()] = user.alias || null;
                                }
                            });
                            
                            // Add friends with aliases when available
                            friends.forEach(friend => {
                                const option = document.createElement('option');
                                option.value = friend.username;
                                
                                // Check if friend has an alias
                                const alias = userAliasMap[friend.username.toLowerCase()];
                                if (alias) {
                                    // Show "alias (username)" format
                                    option.text = `${alias} (${friend.username})`;
                                    // Store username and alias separately for later use
                                    option.dataset.username = friend.username;
                                    option.dataset.alias = alias;
                                } else {
                                    option.text = friend.username;
                                }
                                
                                selectElement.appendChild(option);
                            });
                            
                        } else {
                            // Fall back to showing just usernames
                            this.addFriendsWithoutAliases(friends, selectElement);
                        }
                    } catch (error) {
                        console.error('Error fetching user details:', error);
                        // Fall back to showing just usernames
                        this.addFriendsWithoutAliases(friends, selectElement);
                    }
                } else {
                    // If no friends, add a placeholder option
                    const noFriendsText = getText('no-friends-available') || 'No friends available';
                    const option = document.createElement('option');
                    option.value = "";
                    option.text = noFriendsText;
                    option.disabled = true;
                    selectElement.appendChild(option);
                }
            } else {
                console.error('Failed to load friends list:', response.status);
            }
        } catch (error) {
            console.error('Error loading friends list:', error);
        }
    }
    
    // Helper method to add friends without aliases
    addFriendsWithoutAliases(friends, selectElement) {
        friends.forEach(friend => {
            const option = document.createElement('option');
            option.value = friend.username;
            option.text = friend.username;
            selectElement.appendChild(option);
        });
    }
    
    startGame() {
        // Validate inputs
        const player2Type = document.querySelector('input[name="player2Type"]:checked').value;
        
        let player1, player2;
        let isValid = true;
        
        // Player 1 is always the current user
        if (!this.currentUser) {
            const loginRequiredText = getText('login-required') || 'You must be logged in to play. Redirecting to login page...';
            alert(loginRequiredText);
            window.location.href = '/signin';
            return;
        }
        
        player1 = { 
            type: 'user',
            username: this.currentUser.username,
            id: this.currentUser.id,
            alias: this.currentUser.alias // Include alias for Player 1
        };
        
        // Validate player 2
        if (player2Type === 'user') {
            const select = document.getElementById('player2Username');
            const username = select.value;
            if (!username) {
                const selectFriendValidationText = getText('select-friend-validation') || 'Please select a friend for Player 2';
                alert(selectFriendValidationText);
                isValid = false;
                return;
            }
            
            // Check if the selected option has an alias stored in dataset
            const selectedOption = select.options[select.selectedIndex];
            const alias = selectedOption ? selectedOption.dataset.alias : null;
            
            player2 = { 
                type: 'user', 
                username: username,
                alias: alias // Include alias if available
            };
        } else {
            const guestName = document.getElementById('player2GuestName').value.trim();
            if (!guestName) {
                const enterGuestNameValidationText = getText('enter-guest-name-validation') || 'Please enter a name for Player 2';
                alert(enterGuestNameValidationText);
                isValid = false;
                return;
            }
            player2 = { type: 'guest', name: guestName };
        }
        
        // Validate win score
        const winScore = parseInt(document.getElementById('winScore').value);
        if (isNaN(winScore) || winScore < 1 || winScore > 10) {
            const pointsToWinValidationText = getText('points-to-win-validation') || 'Points to Win must be between 1 and 10';
            alert(pointsToWinValidationText);
            isValid = false;
            return;
        }
        
        if (isValid) {
            // Store game setup in sessionStorage
            const gameSetup = {
                player1,
                player2,
                winScore
            };
            
            sessionStorage.setItem('1v1GameSetup', JSON.stringify(gameSetup));
            
            // Navigate to game page
            window.location.href = '/1v1game';
        }
    }
    
    openAliasEditModal() {
        const aliasInput = document.getElementById('player-alias');
        const errorElement = document.getElementById('player-alias-error');
        
        // Clear any previous errors
        errorElement.textContent = '';
        
        // Set the current value in the input
        aliasInput.value = this.currentUser.alias || '';
        
        // Show the modal using Bootstrap's API
        const modal = new bootstrap.Modal(document.getElementById('editAliasModal'));
        modal.show();
    }
    
    async saveAlias() {
        const aliasInput = document.getElementById('player-alias');
        const errorElement = document.getElementById('player-alias-error');
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
            const response = await fetch(`${BASE_URL}/api/update_user`, {
                method: 'PUT',
                body: formData,
                credentials: 'include'
            });
            
            if (!response.ok) {
                const data = await response.json();
                errorElement.textContent = data.alias 
                    ? data.alias[0] 
                    : (getText('error-updating-alias') || 'Error updating alias');
                return;
            }
            
            // Success - update local data
            this.currentUser.alias = newAlias;
            
            // Update the UI
            const usernameElement = document.getElementById('player1Username');
            if (usernameElement) {
                // Use the new alias or fall back to username
                usernameElement.textContent = this.currentUser.alias || this.currentUser.username;
            }
            
            // Hide the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editAliasModal'));
            if (modal) {
                modal.hide();
            }
            
        } catch (error) {
            console.error('Error updating alias:', error);
            const errorText = getText('error-updating-alias') || 'Error updating alias';
            errorElement.textContent = errorText;
        }
    }
    
    stopJS() {
        // Clean up event listeners
    }
}