require('dotenv').config();
const urlExists = require('url-exists');
const pTimeout = require('p-timeout');
const WebHooks = require('node-webhooks');
const ping = require('ping');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 4444;

//* init express
app.use(cors());
app.use(bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 500000000 }));

var webHooks = new WebHooks({
    db: {
        "sendPcOff": [process.env.SENDOFF],
        "sunsetLight": [process.env.SUNSETLIGHT]
    }
});

var isOn = true;

checkSite();
setInterval(checkSite, 10000);

app.get('/sunset', function (_, res) {
    ping.sys.probe("192.168.178.27", function (isAlive) {
        if (isAlive) {
            webHooks.trigger("sunsetLight");
        }
    }, { timeout: 2 });
    res.end(200);
});

//! server
app.listen(port, function () { console.log(`listening on ${port}`); });

//! functions
async function checkSite() {
    if (await pTimeout(
        new Promise((succeed) => {
            urlExists(process.env.WEBSITE, function (_, exists) {
                succeed(exists);
            });
        }), 1000).catch(() => { return; }) === undefined) {
        if (isOn) {
            webHooks.trigger("sendPcOff");
            isOn = false;
        }
        console.log('undefined');
        return;
    } else {
        isOn = true;
        return;
    }
}