import { navigateTo } from "../index.js";
import { updateTextForElem } from "../utils/languages.js";
import { validateUsername } from "../utils/validateInput.js";

export function signIn() {
	// Get the form elements from the HTML
	const usernameElem = document.getElementById("username");
	const passwordElem = document.getElementById("password");
	const usernameErrorElem = document.getElementById("username-error");
	const passwordErrorElem = document.getElementById("password-error");

	// Add event listeners for when the user leaves the input fields
	usernameElem.addEventListener("blur", () => validateUsername(usernameElem, usernameErrorElem));
	passwordElem.addEventListener("blur", () => validatePassword(passwordElem, passwordErrorElem));

	const signInButton = document.querySelector("#sign-in-button");

	const validatePassword = (passwordElem, passwordErrorElem) => {
		const password = passwordElem.value;
		if (password === '') {
			updateTextForElem(passwordErrorElem, 'password-empty-error');
			return false;
		} else {
			passwordErrorElem.textContent = '\u00A0';
			return true;
		}
	}

	// Add event listener for the submit button
	signInButton.addEventListener("click", async (e) => {
		// Prevent the default behavior of the form
		e.preventDefault();

		// Validate the form
		const usernameValid = validateUsername(usernameElem, usernameErrorElem);
		const passwordValid = validatePassword(passwordElem, passwordErrorElem);

		// If the form is not valid, return
		if (!usernameValid || !passwordValid) {
			return;
		}

		const username = usernameElem.value;
		const password = passwordElem.value;

		const data = {
			username,
			password
		};

		// Send data to the server
		const response = await fetch("/api/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		// If there is an error
		if (response.status === 400) {
			const responseData = await response.json();
			// If the response status is an error, show the error message in the correct fields
			updateTextForElem(usernameErrorElem, responseData.error[0]);
			updateTextForElem(passwordErrorElem, responseData.error[0]);

		} else if (response.status === 200) {
			// If the response status is success, navigate to the profile page
			showTwoFactorForm(username, password);
			//navigateTo("/profile");
		} else {
			// If the response status is unknown, show an error message
			const containerLogin = document.querySelector('.container-login');
			containerLogin.innerHTML = `
				<div class="error text-center">
					<h5 id="failure-message" class="text-white">An error occured in the server</h5>
					<p class="text-white"></p>
				</div>
			`;
			updateTextForElem(document.getElementById('failure-message'), 'sign-up-failure');
		}

	});
}

export function showTwoFactorForm(username, password) {
    // Hide the login form and show the 2FA input form
    const containerLogin = document.querySelector('.container-login');
    containerLogin.innerHTML = `
        <div class="row justify-content-center mb-3">
            <div class="col-12 text-left">
                <label for="two-factor-code" class="text-white">Enter 2FA code:</label>
                <input type="text" class="form-control text-center text-input" id="two-factor-code" maxlength="6">
                <small class="text-danger" id="two-factor-error">&nbsp;</small>
            </div>
        </div>
        <div class="row justify-content-center mt-4">
            <div class="col-12 text-center">
                <button class="btn btn-lg text-light btn-filled" id="verify-2fa-button">Verify 2FA</button>
            </div>
        </div>
    `;

    const verify2faButton = document.querySelector("#verify-2fa-button");
    const twoFactorCodeElem = document.getElementById("two-factor-code");
    const twoFactorErrorElem = document.getElementById("two-factor-error");

    verify2faButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const twoFactorCode = twoFactorCodeElem.value;

        if (twoFactorCode === '') {
            updateTextForElem(twoFactorErrorElem, '2fa-empty-error');
            return;
        }

        const data = {
            username,
            password,
            twoFactorCode
        };

        // Send the 2FA code to the server
        const response = await fetch("/api/verify-2fa", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.status === 200) {
            // If 2FA is verified, navigate to the profile page
            navigateTo("/profile");
        } else {
            const responseData = await response.json();
            updateTextForElem(twoFactorErrorElem, responseData.error[0]);
        }
    });
}