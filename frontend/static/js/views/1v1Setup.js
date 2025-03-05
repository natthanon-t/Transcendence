// import AbstractView from "./AbstractView.js";
// import { BASE_URL } from "../index.js";

// export default class extends AbstractView {
//     constructor() {
//         super();
//         this.setTitle("42_group - 1 vs 1 Setup");
//     }
    
//     async getHtml() {
//         return `
// 		<div class="full-height d-flex flex-column align-items-center justify-content-center">
// 			<div class="container container-tournament p-5 mb-5">
// 				<div class="row justify-content-center mb-2">
// 					<div class="col-12 text-center">
// 						<p class="text-white h1" animated-letters data-translate="1v1-setup">1vs1 Setup</p>
// 					</div>
// 				</div>
// 				<div class="row justify-content-center mb-4">
// 					<div class="col-12 text-left">
// 						<hr class="text-white">
// 					</div>
// 				</div>
            
//             <div class="glass p-4 mb-4" style="max-width: 600px; width: 100%;">
//                 <div class="mb-4">
//                     <h5 class="text-white">Player 1 (You)</h5>
//                     <div id="player1Info" class="card bg-dark text-white p-3 mb-3">
//                         <div class="d-flex align-items-center">
//                             <div id="player1Avatar" class="me-3" style="width: 40px; height: 40px; border-radius: 50%; background-color: #444; overflow: hidden;">
//                                 <!-- User avatar will be loaded here -->
//                             </div>
//                             <div>
//                                 <div id="player1Username" class="fw-bold" style="color: #000; font-size: 16px;">Loading...</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
                    
//                 <div class="mb-4">
//                     <h5 class="text-white">Player 2</h5>
//                     <div class="form-check mb-2">
//                         <input class="form-check-input" type="radio" name="player2Type" id="player2User" value="user">
//                         <label class="form-check-label text-white" for="player2User">
//                             Select Friend
//                         </label>
//                     </div>
//                     <div id="player2UserSelect" class="mt-2 d-none">
//                         <select class="form-select" id="player2Username">
//                             <option value="" selected disabled>Select a friend</option>
//                             <!-- Friends will be loaded here -->
//                         </select>
//                     </div>
//                     <div class="form-check">
//                         <input class="form-check-input" type="radio" name="player2Type" id="player2Guest" value="guest" checked>
//                         <label class="form-check-label text-white" for="player2Guest">
//                             Guest Player
//                         </label>
//                     </div>
//                     <div id="player2GuestInput" class="mt-2">
//                         <input type="text" class="form-control" id="player2GuestName" placeholder="Enter guest name" maxlength="15">
//                     </div>
//                 </div>
                    
//                 <div class="mb-4">
//                     <h5 class="text-white">Game Settings</h5>
//                     <div class="form-group">
//                         <label class="text-white" for="winScore">Points to Win (1-10)</label>
//                         <input type="number" class="form-control" id="winScore" min="1" max="10" value="5">
//                     </div>
//                 </div>
                
//                 <!-- Start Game Button (like the Begin Tournament button) -->
//                 <div class="d-flex justify-content-center mt-4">
//                     <button type="button" id="startGameBtn" class="btn btn-filled">
//                         Start Game
//                     </button>
//                 </div>
//             </div>
            
//             <!-- Return to Game Selection Button -->
//             <a role="button" class="return-btn btn btn-lg text-light text-center d-flex align-items-center justify-content-center p-3 mt-5" href="/selectgame" data-link>
//                 <img src="static/assets/UI/icons/game.svg" alt="menugmae Button" id="gamememnu">
//             </a>
//         </div>
//         `;
//     }
    
//     loadJS() {
//         // Load current user info
//         this.loadCurrentUser();
        
//         // Toggle visibility of player2 user select and guest input
//         document.querySelectorAll('input[name="player2Type"]').forEach(radio => {
//             radio.addEventListener('change', () => {
//                 document.getElementById('player2UserSelect').classList.toggle('d-none', radio.value !== 'user');
//                 document.getElementById('player2GuestInput').classList.toggle('d-none', radio.value !== 'guest');
//             });
//         });
        
//         // Load friends list if logged in
//         this.loadFriendsList();
        
//         // Set up the start game button
//         document.getElementById('startGameBtn').addEventListener('click', () => {
//             this.startGame();
//         });
//     }
    
// 	async loadCurrentUser() {
// 		try {
// 			const response = await fetch(`${BASE_URL}/api/profile`);
			
// 			if (response.status === 200) {
// 				const data = await response.json();
// 				this.currentUser = data.user;
				
// 				console.log("User data:", this.currentUser);
				
// 				// Update UI with user info - ensure username is displayed with contrasting colors
// 				const usernameElement = document.getElementById('player1Username');
// 				if (usernameElement) {
// 					usernameElement.textContent = this.currentUser.username || "You";
					
// 					// Force styling to ensure visibility
// 					usernameElement.style.color = "#000"; // Black text
// 					usernameElement.style.backgroundColor = "transparent";
// 					usernameElement.style.padding = "2px 0";
// 					usernameElement.style.fontSize = "16px";
// 					usernameElement.style.fontWeight = "bold";
// 					usernameElement.style.display = "block";
// 				}
				
// 				// Load avatar (same as before)
// 				try {
// 					const avatarResponse = await fetch(`${BASE_URL}/api/user_avatar`);
// 					if (avatarResponse.status === 200) {
// 						const blob = await avatarResponse.blob();
// 						const url = URL.createObjectURL(blob);
// 						const avatarContainer = document.getElementById('player1Avatar');
// 						avatarContainer.innerHTML = `<img src="${url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
// 					} else {
// 						const avatarContainer = document.getElementById('player1Avatar');
// 						avatarContainer.innerHTML = `<img src="static/assets/images/profile_pic_transparent.png" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
// 					}
// 				} catch (error) {
// 					console.error('Error loading avatar:', error);
// 				}
// 			} else {
// 				window.location.href = '/signin';
// 			}
// 		} catch (error) {
// 			console.error('Error loading user profile:', error);
// 			window.location.href = '/signin';
// 		}
// 	}

//     async loadFriendsList() {
//         try {
//             const response = await fetch(`${BASE_URL}/api/friends_list`);
            
//             if (response.status === 200) {
//                 const friends = await response.json();
//                 const selectElement = document.getElementById('player2Username');
                
//                 // Clear existing options except the first one
//                 while (selectElement.options.length > 1) {
//                     selectElement.remove(1);
//                 }
                
//                 // Add friends as options
//                 if (friends && friends.length > 0) {
//                     friends.forEach(friend => {
//                         const option = document.createElement('option');
//                         option.value = friend.username;
//                         option.text = friend.username;
//                         selectElement.appendChild(option);
//                     });
//                 } else {
//                     // If no friends, add a placeholder option
//                     const option = document.createElement('option');
//                     option.value = "";
//                     option.text = "No friends available";
//                     option.disabled = true;
//                     selectElement.appendChild(option);
//                 }
//             } else {
//                 console.error('Failed to load friends list:', response.status);
//             }
//         } catch (error) {
//             console.error('Error loading friends list:', error);
//         }
//     }
    
//     startGame() {
//         // Validate inputs
//         const player2Type = document.querySelector('input[name="player2Type"]:checked').value;
        
//         let player1, player2;
//         let isValid = true;
        
//         // Player 1 is always the current user
//         if (!this.currentUser) {
//             alert('You must be logged in to play. Redirecting to login page...');
//             window.location.href = '/signin';
//             return;
//         }
        
//         player1 = { 
//             type: 'user',
//             username: this.currentUser.username,
//             id: this.currentUser.id
//         };
        
//         // Validate player 2
//         if (player2Type === 'user') {
//             const username = document.getElementById('player2Username').value;
//             if (!username) {
//                 alert('Please select a friend for Player 2');
//                 isValid = false;
//                 return;
//             }
//             player2 = { type: 'user', username: username };
//         } else {
//             const guestName = document.getElementById('player2GuestName').value.trim();
//             if (!guestName) {
//                 alert('Please enter a name for Player 2');
//                 isValid = false;
//                 return;
//             }
//             player2 = { type: 'guest', name: guestName };
//         }
        
//         // Validate win score
//         const winScore = parseInt(document.getElementById('winScore').value);
//         if (isNaN(winScore) || winScore < 1 || winScore > 10) {
//             alert('Points to Win must be between 1 and 10');
//             isValid = false;
//             return;
//         }
        
//         if (isValid) {
//             // Store game setup in sessionStorage
//             const gameSetup = {
//                 player1,
//                 player2,
//                 winScore
//             };
            
//             sessionStorage.setItem('1v1GameSetup', JSON.stringify(gameSetup));
            
//             // Navigate to game page
//             window.location.href = '/1v1game';
//         }
//     }
    
//     stopJS() {
//         // Clean up event listeners
//     }
// }

// static/js/views/1v1Setup.js
import AbstractView from "./AbstractView.js";
import { BASE_URL } from "../index.js";
import { getText } from "../utils/languages.js"; // Import getText function

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("42_group - 1 vs 1 Setup");
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
                            <div>
                                <div id="player1Username" class="fw-bold" style="color: #000; font-size: 16px;">Loading...</div>
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
                    usernameElement.textContent = this.currentUser.username || youText;
                    
                    // Force styling to ensure visibility
                    usernameElement.style.color = "#000"; // Black text
                    usernameElement.style.backgroundColor = "transparent";
                    usernameElement.style.padding = "2px 0";
                    usernameElement.style.fontSize = "16px";
                    usernameElement.style.fontWeight = "bold";
                    usernameElement.style.display = "block";
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
                    friends.forEach(friend => {
                        const option = document.createElement('option');
                        option.value = friend.username;
                        option.text = friend.username;
                        selectElement.appendChild(option);
                    });
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
            id: this.currentUser.id
        };
        
        // Validate player 2
        if (player2Type === 'user') {
            const username = document.getElementById('player2Username').value;
            if (!username) {
                const selectFriendValidationText = getText('select-friend-validation') || 'Please select a friend for Player 2';
                alert(selectFriendValidationText);
                isValid = false;
                return;
            }
            player2 = { type: 'user', username: username };
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
    
    stopJS() {
        // Clean up event listeners
    }
}