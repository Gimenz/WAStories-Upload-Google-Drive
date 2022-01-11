const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const mime = require('mime-types');
const path = require('path');

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.apps.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.metadata'
];

const CREDENTIALS_PATH = __dirname + '/token/credentials.json';
const TOKEN_PATH = __dirname + '/token/token.json';

if (!fs.existsSync(CREDENTIALS_PATH)) {
    return console.log('credentials file are required, get it on here => https://console.cloud.google.com/apis/');
}
if (!fs.existsSync(TOKEN_PATH)) {
    return console.log('token file are required, get it on here => https://developers.google.com/oauthplayground/');
}

const credentials = require(CREDENTIALS_PATH)
const token = require(TOKEN_PATH)

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);

// const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     prompt: 'consent',
// });


// const getTokenWithRefresh = (secret, refreshToken) => {

//     let oauth2Client = new google.auth.OAuth2(
//         secret.client_id,
//         secret.client_secret,
//         secret.redirect_uris
//     )

//     oauth2Client.credentials.refresh_token = refreshToken

//     oauth2Client.refreshAccessToken((error, tokens) => {
//         if (!error) {
//             console.log(tokens);
//             // persist tokens.access_token
//             // persist tokens.refresh_token (for future refreshs)
//         }
//         console.log(error);
//     })

// }

// console.log(getTokenWithRefresh(credentials.installed, token.refresh_token));

oAuth2Client.setCredentials({ refresh_token: token.refresh_token, access_token: token.access_token });

/**
 * check if folder is exists in drice
 * @param {string} name folder name 
 * @returns 
 */
const checkFolderExists = async (name) => {
    try {
        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        const check = await drive.files.list({ q: "mimeType='application/vnd.google-apps.folder' and name='" + name + "'  and trashed=false ", spaces: 'drive' })
        if (check.data.files.length) {
            return { exists: true, id: check.data.files[0].id }
        } else {
            return { exists: false, id: '' }
        }
    } catch (error) {
        throw error;
    }
}

/**
 * create folder in google drive
 * @param {string} name folder name
 * @param {string} parentId folder id
 * @returns 
 */
const createFolder = async (name, parentId) => {
    try {
        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        let body = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder'
        }
        if (parentId) {
            body['parents'] = [parentId];
        }
        const response = await drive.files.create({
            requestBody: body,
            fields: 'id'
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * upload file to google drive
 * @param {string} filePath path of the file
 * @param {string} parentId folder id
 * @returns 
 */
const uploadFile = async (filePath, parentId) => {
    try {
        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        let body = {
            name: path.basename(filePath),
            parents: [parentId], //Optional and make sure to replace with your folder id.
        };
        let media = {
            body: fs.createReadStream(filePath),
            mimeType: mime.lookup(filePath)
        };
        const response = await drive.files.create({
            requestBody: body,
            fields: 'id',
            media: media
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    checkFolderExists,
    createFolder,
    uploadFile
};
