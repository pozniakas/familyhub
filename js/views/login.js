import { t } from "../i18n.js";

export function renderLoginView() {
  return `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo">FamilyHub</div>
        <form class="form" id="login-form" autocomplete="on">
          <div class="form-group">
            <label class="form-label" for="login-username">${t("loginUsername")}</label>
            <input class="form-input" id="login-username" name="username"
              type="text" autocomplete="username" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">${t("loginPassword")}</label>
            <input class="form-input" id="login-password" name="password"
              type="password" autocomplete="current-password" required>
          </div>
          <p class="login-error" id="login-error" style="display:none"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px">
            ${t("loginBtn")}
          </button>
        </form>
      </div>
    </div>`;
}
