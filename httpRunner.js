var fetch = require('node-fetch');

function runHttp(event, url, cb) {
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(event),
    headers: { 'Content-Type': 'application/json' }})
    .then(res => res.json())
    .then(json => cb(null, json))
    .catch(cb);
}

module.exports = runHttp;