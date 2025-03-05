export function showGdprModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('gdprModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal structure
    const modalHTML = `
        <div class="modal fade" id="gdprModal" tabindex="-1" aria-labelledby="gdprModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content glass">
                    <div class="modal-header">
                        <h5 class="modal-title text-white" id="gdprModalLabel">GDPR Policy</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-white">
                        <p>
                        ENG:
                        We take your privacy seriously. This website collects personal data for account creation,
                        security purposes, and improving user experience. By signing up, you agree to our
                        </p>
                        <p>
                        Thai:
                        เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ เว็บไซต์นี้รวบรวมข้อมูลส่วนบุคคลเพื่อสร้างบัญชี
                        วัตถุประสงค์ด้านความปลอดภัย และปรับปรุงประสบการณ์การใช้งานของผู้ใช้
                        โดยการสมัครใช้งาน คุณตกลงที่จะยอมรับเงื่อนไขของเรา
                        </p>
                        <p>
                        Chinese (Simplified):
                        我们非常重视您的隐私。本网站收集个人数据用于账户创建、
                        安全目的和提升用户体验。注册即表示您同意我们的条款。
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" id="acceptGdpr">Accept</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize and show modal
    const gdprModal = new bootstrap.Modal(document.getElementById('gdprModal'));
    gdprModal.show();

    // Handle "Accept" button click
    document.getElementById("acceptGdpr").addEventListener("click", function() {
        document.getElementById("gdprConsent").checked = true; // Check consent box
        gdprModal.hide(); // Close modal
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("submitForm");
    const submitButton = document.getElementById("submitBtn");

    if (submitButton) { // Ensure the button exists before adding event listeners
        submitButton.addEventListener("click", function (event) {
            const gdprConsent = document.getElementById("gdprConsent");

            if (gdprConsent && !gdprConsent.checked) { // Ensure the checkbox exists
                event.preventDefault(); // Stop form submission
                showGdprModal(); // Show GDPR modal
            }
        });
    }
});

// // Attach event listener to prevent form submission if GDPR is unchecked
// document.addEventListener("DOMContentLoaded", function () {
//     const form = document.getElementById("submitForm");
//     const submitButton = document.getElementById("submitBtn");

//     submitButton.addEventListener("click", function (event) {
//         if (!document.getElementById("gdprConsent").checked) {
//             event.preventDefault(); // Stop form submission
//             showGdprModal(); // Show GDPR modal
//         }
//     });

// });
