const {OAuth2Client} = require("google-auth-library");

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

const verifyGoogleToken = async (token) => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    }catch(error){
        console.log(error);
        return null;
    }
}

module.exports = verifyGoogleToken;