// Helper function to get the display name for a user
export function getDisplayName(user) {
    if (!user) return "Unknown";
    
    // If it's already a string, return it
    if (typeof user === 'string') return user;
    
    // First check for alias, then username, then handle guest names
    if (user.alias) return user.alias;
    if (user.username) return user.username;
    if (user.guest_name) return user.guest_name;
    
    // For tournament players who might have a different structure
    if (user.display_name) return user.display_name;
    
    // Last resort fallbacks
    if (user.name) return user.name;
    return "Unknown";
}

// Function to get display name from tournament player object
export function getTournamentPlayerName(player) {
    if (!player) return "Player";
    
    // If it has display_name property from serializer, use it first
    if (player.display_name) return player.display_name;
    
    // Tournament players might have user object or guest_name
    if (player.user) {
        return getDisplayName(player.user);
    }
    
    return player.guest_name || "Player";
}

// Function to extract and process player data for a match
export function getMatchDisplayNames(match) {
    return {
        player1: match.player1_display_name || getTournamentPlayerName(match.player1) || "Player 1",
        player2: match.player2_display_name || getTournamentPlayerName(match.player2) || "Player 2",
        winner: match.winner_display_name || 
                (match.winner ? getTournamentPlayerName(match.winner) : 
                (match.is_player1_winner ? match.player1_display_name : match.player2_display_name)) || 
                "Unknown"
    };
}