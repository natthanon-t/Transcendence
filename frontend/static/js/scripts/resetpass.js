import { navigateTo } from "../index.js";
import { updateTextForElem } from "../utils/languages.js";

export function resetPassword() {
    // Get form elements
    const emailElem = document.getElementById("email");
    const emailErrorElem = document.getElementById("email-error");
    const resetButton = document.querySelector("#reset-button");

    resetButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = emailElem.value.trim();

        if (email === '') {
            updateTextForElem(emailErrorElem, 'email-empty-error');
            return;
        }

        const data = { email };

        // Send request to backend
        const response = await fetch("/api/resetpass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (response.status === 200) {
            showOtpForm(email);
        } else {
            updateTextForElem(emailErrorElem, responseData.error[0]);
        }
    });
}

export function showOtpForm(email) {
    // Replace login section with OTP input
    document.getElementById("loginsection").innerHTML = `
        <div class="row justify-content-center mb-3">
            <div class="col-12 text-left">
                <label for="otp" class="text-white" data-translate="otp-label">Enter OTP:</label>
                <input type="text" class="form-control text-center text-input" id="otp" maxlength="6">
                <small class="text-danger" id="otp-error">&nbsp;</small>
            </div>
            <div class="col-12 text-left">
                <label for="new-password" class="text-white" data-translate="new-password-label">New Password:</label>
                <input type="password" class="form-control text-center text-input" id="new-password">
                <small class="text-danger" id="password-error">&nbsp;</small>
            </div>
        </div>
        <div class="row justify-content-center mt-4">
            <div class="col-12 text-center">
                <button class="btn btn-lg text-light btn-filled" id="verify-reset-button" data-translate="VerifyOTP">Verify OTP</button>
            </div>
        </div>
    `;

    const verifyButton = document.getElementById("verify-reset-button");

    verifyButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const otpElem = document.getElementById("otp");
        const newPasswordElem = document.getElementById("new-password");
        const otpErrorElem = document.getElementById("otp-error");
        const passwordErrorElem = document.getElementById("password-error");

        const otp = otpElem.value.trim();
        const newPassword = newPasswordElem.value.trim();

        if (otp === '') {
            updateTextForElem(otpErrorElem, 'otp-empty-error');
            return;
        }
        if (newPassword === '') {
            updateTextForElem(passwordErrorElem, 'password-empty-error');
            return;
        }

        const data = { email, otp, new_password: newPassword };

        const response = await fetch("/api/verify-otp-reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (response.status === 200) {
            alert("Password successfully reset!");
            navigateTo("/signin");
        } else {
            updateTextForElem(otpErrorElem, responseData.error[0]);
        }
    });
}
