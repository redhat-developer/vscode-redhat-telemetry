var https = require('https');
var fs = require('fs');

function download(url, dest) {
  var file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
  });
}
const FILE = 'src/telemetry.ts';
const REMOTE_URL = 'https://raw.githubusercontent.com/redhat-developer/vscode-commons/master/src/interfaces/telemetry.ts'
console.log('Updating \''+ FILE +'\' from '+REMOTE_URL);
download(REMOTE_URL, FILE);
console.log('Updated \''+ FILE +'\'');