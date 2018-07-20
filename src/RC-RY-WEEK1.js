var SDK = require('ringcentral');
var fs = require('fs');
var dotenv = require('dotenv');

const envResult = dotenv.config();
if (envResult.error) {
    console.log('dev.env configuration error.');
    
}

const appKey = process.env.RINGCENTRAL_CLIENT_ID;
const appSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
const serverUrl = process.env.RINGCENTRAL_SERVER_URL;

module.exports = class Week1Module {

    constructor() {
        this.rcsdk = new SDK({
            server: serverUrl,
            appKey: appKey,
            appSecret: appSecret,
            redirectUri: '' // optional, but is required for Implicit Grant and Authorization Code OAuth Flows (see below)
        });

        this.subscriptionCacheKey = 'rc-rk-subscription-cache'
        const subscription = this.rcsdk.createCachedSubscription(this.subscriptionCacheKey);

        subscription.on(subscription.events.notification, this.handleNotificationResponse);
        this.subscription = subscription;
        this.platform = this.rcsdk.platform();
    }

    handleNotificationResponse(msg) {
        console.log(msg.event + ' => Received ...', msg.body);
    }

    /**
     * Run to listen on the Presence for an account defined by the options.
     *
     * @param {*} [opts={ account, extension }]
     */
    listenOnPresence() {
        this.subscription
            .restore(['/account/~/extension/~/presence'])
            .register()
            .then(_ => console.log('Listen presence succeed.'))
            .catch(error => console.log('Listen presence failed.', error));
    }

    login(account) {
        return new Promise((resolve, reject) => {
            console.log('Logging in ...');
            const platform = this.platform;

            // login
            platform.login({
                    username: account.userName, // phone number in full format
                    extension: '', // leave blank if direct number is used
                    password: account.password
                }).then(res => {
                    const token = res.json();

                    if (token) {
                        console.log('Logged in!');
                        resolve(res);
                    } else {
                        reject(res);
                    }
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        });
    }

    readCallRecordings(accountId) {
        this
            .platform
            .get(`/account/${accountId || '~'}/call-log`)
            .then(res => {
                const data = res.json();
                if (data && data.length) {
                    console.log(`Get total about: ${data.records.length} call logs`);
                    const firstRecord = data.records[0];
                    const contentUrl = `/account/${accountId}/recording/${firstRecord.sessionId}/content`;
                    console.log(`downloading first record content from URL: ${contentUrl}...`, firstRecord);
                    this
                        .platform
                        .get(contentUrl)
                        .then(res => {
                            res.response().body.pipe(fs.createWriteStream(`./${firstRecord.sessionId}.mp3`));
                        });
                } else {
                    console.log('no call recordings.');
                }

            })
    }
};