var storage = chrome.storage.sync;      // Synced chrome storage

// Reset the extension state on startup.
chrome.runtime.onStartup.addListener(function() {
	chrome.storage.local.remove("pbSession");
});

/**
* 
* @description adds a new bookmark
*/
chrome.contextMenus.onClicked.addListener(function(info,tab) {
    var tabs = new Array();
    storage.get('private', function(items) {
        if(items.private) {
            tabs = items.private;
            tabs.push(tab);
            storage.set({'private': tabs});
        } else {
            tabs.push(tab);
            storage.set({'private': tabs});
        }
    });
    storage.get('settings', function(items) {
        if(items.settings[0]) {
            chrome.tabs.remove(tab.id);
        }
    });
});
