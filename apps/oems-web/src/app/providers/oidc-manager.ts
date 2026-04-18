import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { runtimeConfig } from "@/config/runtime";

let cachedUserManager: UserManager | null = null;

const createOidcUserManager = (): UserManager =>
  new UserManager({
    authority: runtimeConfig.oidcIssuer,
    automaticSilentRenew: true,
    client_id: runtimeConfig.oidcClientId,
    filterProtocolClaims: true,
    loadUserInfo: false,
    monitorSession: false,
    post_logout_redirect_uri: runtimeConfig.oidcPostLogoutRedirectUri,
    redirect_uri: runtimeConfig.oidcRedirectUri,
    response_type: "code",
    scope: runtimeConfig.oidcScope,
    silent_redirect_uri: runtimeConfig.oidcSilentRedirectUri,
    userStore: new WebStorageStateStore({ store: window.sessionStorage })
  });

export const getOidcUserManager = (): UserManager => {
  if (!cachedUserManager) {
    cachedUserManager = createOidcUserManager();
  }

  return cachedUserManager;
};

export const resetOidcUserManagerForTests = (): void => {
  cachedUserManager = null;
};
