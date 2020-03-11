require('dotenv').config();
const urlExists = require('url-exists');
const pTimeout = require('p-timeout');
const WebHooks = require('node-webhooks');

var webHooks = new WebHooks({
    db: { "sendPcOff": [process.env.WEBHOOK] }
});

var isOn = true;

checkSite();
setInterval(checkSite, 10000);

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