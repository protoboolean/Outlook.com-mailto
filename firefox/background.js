/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// Verify setting validity
function verify(info) {
	if (info.mode != 'ask' && info.mode != 'live' && info.mode != 'office') {
		browser.storage.local.set({mode: 'ask'});
	}
}

// Handle tab that will lose parameters
function handleIncomplete(tabId, changeInfo, tabInfo) {
	removeHandlers();
	browser.tabs.update(tabInfo.id,{url:tmpUrl});
	tmpUrl = null;
}

// Handle tab that will not lose parameters
function handleComplete(tabId, changeInfo, tabInfo) {
	console.log("Running");
	removeHandlers();
}

// Remove tab handlers
function removeHandlers() {
	browser.tabs.onUpdated.removeListener(handleIncomplete);
	browser.tabs.onUpdated.removeListener(handleComplete);
}

// Message handler
function listenMessage(message) {
	if (message.code == 'create-handler') {
		// Create required handlers
		browser.tabs.onUpdated.addListener(handleIncomplete, filter);
		tmpUrl = message.msg[0];
		var redirect = tmpUrl.slice(0,tmpUrl.indexOf("/compose?to="));
		browser.tabs.onUpdated.addListener(handleComplete, {urls:[redirect + message.msg[1]]});
	}
}

let data = browser.storage.local.get();
data.then(verify);
var tmpUrl;
const filter = {urls:["*://outlook.live.com/mail/deeplink/compose",
	"*://outlook.office.com/mail/deeplink/compose"]};
chrome.runtime.onMessage.addListener(listenMessage);