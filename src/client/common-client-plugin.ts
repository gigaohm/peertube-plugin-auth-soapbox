import { RegisterClientOptions } from "@peertube/peertube-types/client";

function register({ registerHook, peertubeHelpers }: RegisterClientOptions) {
  registerHook({
    target: "action:login.init",
    handler: () => {
      // Add SoapBox login button to the login page
      addSoapboxLoginButton();
    },
  });

  registerHook({
    target: "action:application.init",
    handler: () => {
      // Add SoapBox login button to the application
      addSoapboxLoginButton();
    },
  });

  function addSoapboxLoginButton() {
    // Check if button already exists
    if (document.querySelector(".soapbox-login-button")) {
      return;
    }

    // Find the login form container
    const loginForm =
      document.querySelector(".login-form") ||
      document.querySelector(".signup-form");
    if (!loginForm) {
      return;
    }

    // Create SoapBox login button
    const soapboxButton = document.createElement("div");
    soapboxButton.className = "soapbox-login-button";
    soapboxButton.innerHTML = `
      <div class="form-group">
        <div class="login-button-and-external-auth">
          <a href="/plugins/auth-soapbox/login" class="orange-button">
            <i class="icon icon-soapbox" aria-hidden="true"></i>
            ${peertubeHelpers.translate("Login with SoapBox")}
          </a>
        </div>
      </div>
    `;

    // Add some basic styling
    const style = document.createElement("style");
    style.textContent = `
      .soapbox-login-button {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--mainBorderColor);
      }

      .soapbox-login-button .orange-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: #6366f1;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      .soapbox-login-button .orange-button:hover {
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
      }

      .soapbox-login-button .orange-button:focus {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
      }

      .icon-soapbox::before {
        content: "📱";
        font-size: 1.2em;
      }
    `;

    document.head.appendChild(style);
    loginForm.appendChild(soapboxButton);
  }
}

export { register };
