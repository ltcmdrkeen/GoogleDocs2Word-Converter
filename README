# Export .gdoc to docx / word 

- This takes .gdoc files and converts them to .docx via Google Drive
- Docx files will be stored in the very same directory as the gdoc files are
- You can adapt this to any other MIME type, e.g. PDF (see https://developers.google.com/drive/api/v3/ref-export-formats)
    - Change the constant `EXPORT_MIME_TYPE` (default: "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    - Change the constant `FILE_ENDING` (default: ".docx")

## Steps to start:

- List the files that you want to convert in the `files.txt`
- Create OAuth2 credentials in your google cloud console and save them in this directory with the name `credentials.json`
    - Set it up here: https://console.cloud.google.com/apis/credentials/consent
    - Create credentials here: https://console.cloud.google.com/apis/credentials
    - Use the following SCOPE (might not need everything here, check again):
        - 'https://www.googleapis.com/auth/documents.readonly', 
        - 'https://www.googleapis.com/auth/drive',
        - 'https://www.googleapis.com/auth/drive.appdata',
        - 'https://www.googleapis.com/auth/drive.file',
        - 'https://www.googleapis.com/auth/drive.metadata',
- Run `npm install` and then `node index.js`
- The script will prompt you to gain permissions via google OAuth2 screen
    - follow the link and copy your credentials into the console when prompted
- After that, your downloads will start