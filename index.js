const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const stream = require('stream');
const {promisify} = require('util');
const finished = promisify(stream.finished);

const EXPORT_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const FILE_ENDING = ".docx";


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly',  'https://www.googleapis.com/auth/drive',
'https://www.googleapis.com/auth/drive.appdata',
'https://www.googleapis.com/auth/drive.file',
'https://www.googleapis.com/auth/drive.metadata',
'https://www.googleapis.com/auth/drive.metadata.readonly',
'https://www.googleapis.com/auth/drive.photos.readonly',
'https://www.googleapis.com/auth/drive.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Docs API.
  authorize(JSON.parse(content), exportFiles);
  
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


async function exportFiles(auth) {
    
    const drive = google.drive({version: 'v3', auth});
    let files = await getGDocsFromFilesTxt();
    for(let f of files) {
        var tmpPath = f.path.replace(".gdoc", FILE_ENDING);
        var dest = fs.createWriteStream(tmpPath);
        console.log("Downloading to "+tmpPath);
        var fileId = f.doc_id;
        var error = false;
        var response = await drive.files.export({
            fileId: fileId,
            mimeType: EXPORT_MIME_TYPE
        }, {
            responseType: 'stream'
        });
        console.log("DONE DOWNLOADING");
        if(response.status === 200) {
            const writeFile = async (resp, writer) => {
                response.data.pipe(writer);
                return finished(writer); //this is a Promise
            }
            await writeFile(response, dest)
            console.log("DONE WRITING");
        }else{
            break;
        }
        
        
        
    }
    
  }


async function getGDocsFromFilesTxt() {
    const fileStream = fs.createReadStream('files.txt');
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    var files = [];
    for await (const file of rl) {
      // Each line in input.txt will be successively available here as `line`.
      let rawdata = fs.readFileSync(file);
      let doc = JSON.parse(rawdata);
      doc.path = file;
      files.push(doc);
    }
    return files;
  }
  
  