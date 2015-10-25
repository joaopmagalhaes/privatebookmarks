/**
* Private Bookmarks chrome extension
* Popup.js
* @author Magalhaes
*
*/

var storage = chrome.storage.sync;      // Synced chrome storage
var local = chrome.storage.local;       // Local chrome storage
var contextMenuId;                      // ID for the context menu (add bookmark)
var bookmarksArray = new Array();       // Array of bookmarks
var hints = [chrome.i18n.getMessage("hintuse1"),chrome.i18n.getMessage("hintuse2")];

//storage.remove("private");

Array.prototype.clone = function() {
	return this.slice(0);
};

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].id === a[j].id)
                a.splice(j--, 1);
        }
    }

    return a;
};

/**
* 
* @description load current user language
*/
function translate() {
    $('#welcome').text(chrome.i18n.getMessage("welcome"));
    $('#hintstart').text(chrome.i18n.getMessage("hintstart"));
    $('#txtPassword').attr('placeholder',chrome.i18n.getMessage("password"));
    $('#txtPasswordConf').attr('placeholder',chrome.i18n.getMessage("confirmpassword"));
    $('#btnSet').text(chrome.i18n.getMessage("submit"));
    $('#hintlogin').text(chrome.i18n.getMessage("hintlogin"));
    $('#txtPwd').attr('placeholder',chrome.i18n.getMessage("password"));
    $('#btnEnter').text(chrome.i18n.getMessage("enter"));
}

/**
* 
* @description checks if there's a password set
*/
function checkPasswordSet() {
	storage.get('pbPwd', function(items) {
		if (items.pbPwd) {
			checkSession();
		} else {
			display("block","none","none");
		}
	});
}

/**
* 
* @description checks if there's a session started
*/
function checkSession() {
    local.get("pbSession", function(items) {
        if(items.pbSession) {
            startSession();
        } else {
            display("none","block","none");
        }
    });
}

/**
* 
* @description start a new session and creates the context menu
*/
function startSession() {
    local.set({"pbSession":"on"});
    display("none","none","block");
    message("");
    getBookmarks();
    chrome.contextMenus.removeAll();
    contextMenuId = chrome.contextMenus.create({"id":"contextPB","title":chrome.i18n.getMessage("addbookmark")});
}

/**
* 
* @description writes a new message
*/
function message(msg) {
	$("#message").html(msg);
}

/**
* 
* @description updates the UI with different sections
*/
function display(init, login, bookmarks) {
	$("#init").css("display",init);
	$("#login").css("display",login);
	$("#bookmarks").css("display",bookmarks);
}

/**
* 
* @description gets all the bookmarks from the private storage
*/
function getBookmarks() {
    bookmarksArray = new Array();
    storage.get('private', function(items) {
        if(items.private) {
            bookmarksArray = items.private.clone();
        }
        updateUI();
    });
}

/**
* 
* @description updates the UI with all the user's bookmarks
*/
function updateUI() {
	var divBookmarks = $("#bookmarks");
	divBookmarks.empty();
    var info = document.createElement("p");
    var i = Math.floor(Math.random()*2);
    info.innerHTML = chrome.i18n.getMessage("hint") + ": " + hints[i];
    var content = document.createElement("ul");
    content.setAttribute("id","sortable");
    for (var i = 0; i < bookmarksArray.length; i++) {
        var currentTab = bookmarksArray[i];
        // Create the list element
        var li = document.createElement("li");
        li.setAttribute("class", "ui-state-default");
        li.addEventListener("click",function(e){openBookmark(e,false,false,false);},false);
        li.addEventListener("mouseover",function(e){toggleDelete(e,$(this));});
        li.addEventListener("mouseout",function(e){toggleDelete(e,$(this));});
        $(li).data("tab",currentTab);
        // Create favIcon
        var favIcon = document.createElement("img");
        favIcon.setAttribute("src",currentTab.favIconUrl);
        favIcon.setAttribute("class","favIcon");
        // Create delete icon
        var delIcon = document.createElement("img");
        delIcon.setAttribute("src","img/delete.png");
        delIcon.setAttribute("class","delete");
        delIcon.setAttribute("title",chrome.i18n.getMessage("delete"));
        delIcon.addEventListener("click",function(e){deleteBookmark(e)},false);
        // Create new window icon
        var newWindow = document.createElement("img");
        newWindow.setAttribute("src","img/OpenNewTab.png");
        newWindow.setAttribute("class","optIcons");
        newWindow.setAttribute("title",chrome.i18n.getMessage("open"));
        newWindow.addEventListener("click",function(e){openBookmark(e,true,false,true);},false);
        // Create incognito icon
        var incognito = document.createElement("img");
        incognito.setAttribute("src","img/incognito.png");
        incognito.setAttribute("class","optIcons");
        incognito.setAttribute("title",chrome.i18n.getMessage("openincognito"));
        incognito.addEventListener("click",function(e){openBookmark(e,true,true,false);},false);
        // Link all together
        li.innerHTML = (currentTab.title.length > 34) ? currentTab.title.slice(0,34) + '...' : currentTab.title;
        li.appendChild(delIcon);
        li.appendChild(favIcon);
        li.appendChild(newWindow);
        li.appendChild(incognito);
        content.appendChild(li);
    }
    // Create the logout button
    var btnLogout = document.createElement("button");
    btnLogout.setAttribute("id", "btnLogout");
    btnLogout.setAttribute("name", "btnLogout");
    btnLogout.innerHTML = chrome.i18n.getMessage("logout");
    btnLogout.addEventListener("click", logout);
    // Create the add bookmark button
    var btnAdd = document.createElement("button");
    btnAdd.setAttribute("id", "btnAdd");
    btnAdd.setAttribute("name", "btnAdd");
    btnAdd.innerHTML = chrome.i18n.getMessage("addbookmark");
    btnAdd.addEventListener("click", addBookmark);
    // Append to the master div
    divBookmarks.append(info);
    divBookmarks.append(content);
    divBookmarks.append(btnAdd);
	divBookmarks.append(btnLogout);
    // Make bookmarks sortable
    $('#sortable').sortable({
        stop: function(event, ui) {
            bookmarksArray = new Array();
            $("#sortable li").each(function(){
                bookmarksArray.push($(this).data("tab"));
            });
            setBookmarks();
        }
    });
    $('#sortable').disableSelection();
}

/**
* 
* @description show/hide the delete button
*/
function toggleDelete(e,li) {
    if(e.type == "mouseover") {
        li.find(".favIcon").css("margin-left","0px");
    } else {
        li.find(".favIcon").css("margin-left","21px");
    }
    li.find(".delete").toggle();
}

/**
* 
* @description add new bookmark
*/
function addBookmark() {
    chrome.tabs.getSelected(function(tab) {
        bookmarksArray.push(tab);
        setBookmarks();
        storage.get('settings', function(items) {
            if(items.settings[0]) {
                chrome.tabs.remove(tab.id);
            }
        });
    });
}

/**
* 
* @description opens the bookmark
*/
function openBookmark(e,img,incognito,newWindow) {
    e.stopPropagation();
    if(img) {
        var tab = $(e.target.parentElement).data("tab");
    } else {
        var tab = $(e.target).data("tab");
    }
    if(newWindow || incognito) {
        chrome.windows.create({"url":tab.url,"incognito":incognito,"focused":true});
    } else {
        chrome.tabs.create({"url":tab.url,"active":true});
    }
}

/**
* 
* @description delete a bookmark from the list
*/
function deleteBookmark(e) {
    e.stopPropagation();
    var tab = $(e.target.parentElement).data("tab");
    if(confirm(chrome.i18n.getMessage("deletebookmark") + "?")) {
        var index = bookmarksArray.indexOf(tab);
        bookmarksArray.splice(index,1);
        setBookmarks();
    }
}

/**
* 
* @description sets the private storage with all the bookmarks
*/
function setBookmarks() {
    bookmarksArray.unique();
    storage.set({'private': bookmarksArray},updateUI);
}

/**
* 
* @description sets a new password for the user
*/
function setNewPassword() {
	var pwd = $('input[id=txtPassword]').val();
	var pwdConf = $('input[id=txtPasswordConf]').val();
	if(pwd === pwdConf) {
		storage.set({'pbPwd': pwd});
        startSession();
	} else {
		message(chrome.i18n.getMessage("nomatch"));
	}
};

/**
* 
* @description handles the login procedure, creating a new session
*/
function login() {
	var pwd = $('input[id=txtPwd]').val();
	storage.get('pbPwd', function(items) {
		if (items.pbPwd) {
			if(items.pbPwd === pwd) {
                startSession();
			} else {
				message(chrome.i18n.getMessage("wrongpassword"));
			}
		} else {
			display("block","none","none");
		}
	});
};

/**
* 
* @description handles the logout procedure, end the current user session
*/
function logout() {
    $('input[id=txtPwd]').val('');
    setBookmarks();
    chrome.contextMenus.remove(contextMenuId);
    contextMenuId = null;
    local.remove("pbSession");
    display("none","block","none");
}

// When dom loaded, register events for click and key press
$(document).ready(function(){
    $("#btnSet").click(setNewPassword);
    $("#txtPassword, #txtPasswordConf").keypress(function(e) {
       if(e.which == 13) {
           setNewPassword();
           $('#txtPassword').focus();
       }
    });
    $("#btnEnter").click(login);
    $("#txtPwd").keypress(function(e) {
       if(e.which == 13) {
           login();
           $('#txtPwd').focus();
       }
    });
    
    checkPasswordSet();
    translate();
});

