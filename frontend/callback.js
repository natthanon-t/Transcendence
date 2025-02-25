async function handle42OAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
        console.error("No authorization code found.");
        return;
    }

    // Send code to Django backend for authentication
    const response = await fetch(`https://localhost/api/auth/42/callback/?code=${code}`);
    const data = await response.json();

    if (data.token) {
        localStorage.setItem("authToken", data.token);
        window.location.href = "/dashboard"; // Redirect user after login
    } else {
        console.error("OAuth login failed:", data.error);
    }
}

window.onload = handle42OAuthCallback;
