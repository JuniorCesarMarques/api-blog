const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client("SEU_CLIENT_ID");

async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience:
      "250624763798-fddhjadj6cq46bpo1qs5cee4pdbs7d1j.apps.googleusercontent.com",
  });
  return ticket.getPayload();
}

module.exports = verifyGoogleToken;
