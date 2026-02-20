// src/services/auth.js
// Direct Cognito authentication — no Amplify dependency
// Uses AWS Cognito USER_PASSWORD_AUTH flow directly

const USER_POOL_ID = "us-east-2_qXO8kHFOj";
const CLIENT_ID = "47edciociemavkgvunh74u1pp8";
const REGION = "us-east-2";
const COGNITO_URL = `https://cognito-idp.${REGION}.amazonaws.com/`;

// In-memory token storage
let _tokens = { idToken: null, accessToken: null, refreshToken: null, expiry: null };

export function getStoredToken() {
  // Check memory first
  if (_tokens.idToken && _tokens.expiry && Date.now() < _tokens.expiry) {
    return _tokens.idToken;
  }
  // Check localStorage
  try {
    const stored = localStorage.getItem("pixorus_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.idToken && parsed.expiry && Date.now() < parsed.expiry) {
        _tokens = parsed;
        return parsed.idToken;
      }
    }
  } catch {}
  return null;
}

function storeTokens(idToken, accessToken, refreshToken, expiresIn = 3600) {
  _tokens = {
    idToken,
    accessToken,
    refreshToken,
    expiry: Date.now() + (expiresIn * 1000) - 60000, // 1 min buffer
  };
  try {
    localStorage.setItem("pixorus_auth", JSON.stringify(_tokens));
  } catch {}
}

export function clearTokens() {
  _tokens = { idToken: null, accessToken: null, refreshToken: null, expiry: null };
  try { localStorage.removeItem("pixorus_auth"); } catch {}
}

export async function signInDirect(username, password) {
  const res = await fetch(COGNITO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.__type || "Login failed");
  }

  if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    throw new Error("Password change required. Please contact admin.");
  }

  if (!data.AuthenticationResult) {
    throw new Error("Authentication failed — no tokens returned");
  }

  const { IdToken, AccessToken, RefreshToken, ExpiresIn } = data.AuthenticationResult;
  storeTokens(IdToken, AccessToken, RefreshToken, ExpiresIn);
  return { idToken: IdToken, accessToken: AccessToken };
}

export async function refreshSession() {
  const stored = JSON.parse(localStorage.getItem("pixorus_auth") || "{}");
  if (!stored.refreshToken) return null;

  const res = await fetch(COGNITO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: stored.refreshToken,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.AuthenticationResult) return null;

  const { IdToken, AccessToken, ExpiresIn } = data.AuthenticationResult;
  storeTokens(IdToken, AccessToken, stored.refreshToken, ExpiresIn);
  return IdToken;
}

export async function getValidToken() {
  // Try stored token
  const token = getStoredToken();
  if (token) return token;

  // Try refresh
  const refreshed = await refreshSession();
  if (refreshed) return refreshed;

  return null;
}

export function isAuthenticated() {
  return !!getStoredToken();
}
