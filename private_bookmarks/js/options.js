/**
* Private Bookmarks chrome extension
* options.js
* @author Magalhaes
*
*/

var storage = chrome.storage.sync;          // Synced chrome storage
var local = chrome.storage.local;           // Local chrome storage
var bookmarksArray = new Array();           // Array of bookmarks

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
    document.title = chrome.i18n.getMessage("optionstitle");
    $('a[href=#bookmarks]').text(chrome.i18n.getMessage("bookmarks"));
    $('a[href=#security]').text(chrome.i18n.getMessage("security"));
    $('a[href=#settings]').text(chrome.i18n.getMessage("settings"));
    $('a[href=#backup]').text(chrome.i18n.getMessage("backup"));
    $('a[href=#support]').text(chrome.i18n.getMessage("support"));
    $('#bookmarksTable tr th:nth-child(2)').text(chrome.i18n.getMessage("name"));
    $('#bookmarksTable tr th:nth-child(3)').text(chrome.i18n.getMessage("url"));
    $('#bookmarksTable tr th:nth-child(4)').text(chrome.i18n.getMessage("actions"));
    $('#btnSelectAll').text(chrome.i18n.getMessage("selectall"));
    $('#btnInvertSelection').text(chrome.i18n.getMessage("invertselection"));
    $('#btnDeleteBulk').text(chrome.i18n.getMessage("deletebookmarks"));
    $('#txtCurrentPassword').attr('placeholder',chrome.i18n.getMessage("currentpassword"));
    $('#txtPassword').attr('placeholder',chrome.i18n.getMessage("newpassword"));
    $('#txtPasswordConf').attr('placeholder',chrome.i18n.getMessage("confirmpassword"));
    $('#btnSet').text(chrome.i18n.getMessage("submit"));
    $('#closeTab').text(chrome.i18n.getMessage("closetab"));
    $('#keyboardshortcut').text(chrome.i18n.getMessage("keyboardshortcut"));
    $('#btnReset').text(chrome.i18n.getMessage("resetbtn"));
    $('#resetwarning').text(chrome.i18n.getMessage("resetwarning"));
    $('#backuptitle').text(chrome.i18n.getMessage("backup"));
    $('#initbackuphelp').text(chrome.i18n.getMessage("initbackuphelp"));
    $('#restoretitle').text(chrome.i18n.getMessage("restore"));
    $('#btnRestore').text(chrome.i18n.getMessage("initrestore"));
    $('#initrestorehelp').text(chrome.i18n.getMessage("initrestorehelp"));
    $('#txtPwdRestore').attr('placeholder',chrome.i18n.getMessage("password"));
    $('#sp1').text(chrome.i18n.getMessage("supportintroduction"));
    $('#sp2').text(chrome.i18n.getMessage("supportsuggest"));
    $('#btnHelp').text(chrome.i18n.getMessage("supporthelp"));
    $('#resportbug').text(chrome.i18n.getMessage("reportbug"));
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
            loadBookmarks();
        }
    });
}

/**
* 
* @description loads all the bookmarks to the page
*/
function loadBookmarks() {
    var tableBody = $('#table-body');
    tableBody.empty();
    var tr,td,span,chkbox,btnEdit,btnDelete,btnSave,btnCancel,inputName,inputUrl;
    for(var b = 0; b < bookmarksArray.length; b++) {
        tr = document.createElement('tr');
        tr.setAttribute("id",b);
        tr.setAttribute("style","max-width:100px");
        // Add checkbox
        td = document.createElement('td');
        td.setAttribute("style","text-align: center; vertical-align: middle");
        chkbox = document.createElement('input');
        chkbox.setAttribute("id","chkbox"+b);
        chkbox.setAttribute("type","checkbox");
        chkbox.setAttribute("value",bookmarksArray[b].id);
        td.appendChild(chkbox);
        tr.appendChild(td);
        // Get title
        td = document.createElement('td');
        td.setAttribute("style","vertical-align: middle");
        span = document.createElement("span");
        if(bookmarksArray[b].title.length > 30) titleMod = bookmarksArray[b].title.substring(0,27) + "...";
        else titleMod = bookmarksArray[b].title;
        span.innerHTML = "<img src=\""+bookmarksArray[b].favIconUrl+"\" class=\"favIcon\"/> " + titleMod;
        td.appendChild(span);
        // Add the name input for edit
        inputName = document.createElement("input");
        inputName.setAttribute("id","inputName"+b);
        inputName.value = bookmarksArray[b].title;
        $(inputName).keypress(function(e) {
           if(e.which == 13) {
               editBookmark(e);
           }
        });        
        $(inputName).hide();
        td.appendChild(inputName);
        tr.appendChild(td);
        // Get url
        td = document.createElement('td');
        td.setAttribute("style","vertical-align: middle");
        span = document.createElement("span");
        if(bookmarksArray[b].url.length > 100) urlMod = bookmarksArray[b].url.substring(0,97) + "...";
        else urlMod = bookmarksArray[b].url;
        span.innerHTML = "<a href=\"" + bookmarksArray[b].url + "\" title=\"" + bookmarksArray[b].title + "\" target=\"_blank\">" + urlMod + "</a>";
        td.appendChild(span);
        // Add the name input for edit
        inputUrl = document.createElement("input");
        inputUrl.setAttribute("id","inputUrl"+b);
        inputUrl.value = bookmarksArray[b].url;
        $(inputUrl).keypress(function(e) {
           if(e.which == 13) {
               editBookmark(e);
           }
        });
        $(inputUrl).hide();
        td.appendChild(inputUrl);
        tr.appendChild(td);
        // Add edit button
        td = document.createElement('td');
        td.setAttribute("style","vertical-align: middle");
        btnEdit = document.createElement('button');
        btnEdit.setAttribute('class','btn btn-primary');
        btnEdit.setAttribute('type','button');
        btnEdit.innerHTML = chrome.i18n.getMessage("edit");
        btnEdit.addEventListener("click", toggleEdit);
        td.appendChild(btnEdit);
        // Add delete button
        btnDelete = document.createElement('button');
        btnDelete.setAttribute('class','btn btn-danger');
        btnDelete.setAttribute('type','button');
        btnDelete.innerHTML = chrome.i18n.getMessage("delete");
        btnDelete.addEventListener("click", deleteBookmark);
        td.appendChild(btnDelete);
        // Add save button
        btnSave = document.createElement('button');
        btnSave.setAttribute('class','btn btn-primary');
        btnSave.setAttribute('type','button');
        btnSave.innerHTML = chrome.i18n.getMessage("save");
        btnSave.addEventListener("click", editBookmark);
        $(btnSave).hide();
        td.appendChild(btnSave);
        // Add cancel button
        btnCancel = document.createElement('button');
        btnCancel.setAttribute('class','btn btn-danger');
        btnCancel.setAttribute('type','button');
        btnCancel.innerHTML = chrome.i18n.getMessage("cancel");
        btnCancel.addEventListener("click", toggleEdit);
        $(btnCancel).hide();
        td.appendChild(btnCancel);
        // Add to table
        tr.appendChild(td);
        tableBody.append(tr);
    }
}

/**
*
* @description select all bookmarks
*/
function selectAll() {
    $('#bookmarksTable input[type=checkbox]').prop('checked',true);
}

/**
*
* @description invert selection bookmarks
*/
function invertSelection() {
    $('#bookmarksTable input[type=checkbox]').each(function() {
        $(this).prop('checked', !$(this).prop('checked'));
    });
}

/**
* 
* @description enable/disable change in text fields
*/
function toggleEdit(e) {
    var tr = $(e.target.parentElement.parentElement);
    // Toggle visibility of buttons and inputs
    tr.find(".btn").toggle();
    tr.find("input").toggle();
    tr.find("span").toggle();
}

/**
* 
* @description edits the name and URL of the bookmarks
*/
function editBookmark(e) {
    var tr = $(e.target.parentElement.parentElement);
    var index = tr.attr("id");
    var name = $("#inputName"+index).val();
    var url = $("#inputUrl"+index).val();
    bookmarksArray[index].title = name;
    bookmarksArray[index].url = url;
    setBookmarks();
}

/**
* 
* @description deletes a bookmark
*/
function deleteBookmark(e) {
    var index = $(e.target.parentElement.parentElement).attr("id");
    if(confirm(chrome.i18n.getMessage("deletebookmark") + '?')) {
        bookmarksArray.splice(index,1);
        setBookmarks();
    }
}

/**
* 
* @description deletes bulk bookmarks
*/
function deleteBookmarks() {
    if(confirm(chrome.i18n.getMessage("deletebookmarks") + '?')) {
        $('#bookmarksTable input[type=checkbox]:checked').each(function() {
            for(var g = bookmarksArray.length; g--;) {
                if(bookmarksArray[g].id == this.value) {
                    bookmarksArray.splice(g,1);
                }
            }
        });
        setBookmarks();
    }
}

/**
* 
* @description sets the private storage with all the bookmarks
*/
function setBookmarks() {
    bookmarksArray.unique();
    storage.set({'private': bookmarksArray},getBookmarks);
}

/**
* 
* @description toggle the ability to edit the keyboard shortcut and add/remove listeners
*/
function toggleShorcut() {
    var shorcutState = $('input[name=keyboardShorcut]').prop('checked');
    $('#keyBind1').prop('disabled', !shorcutState);
    $('#keyBind2').prop('disabled', !shorcutState);
    $('#keyBind3').prop('disabled', !shorcutState);
}

/**
* 
* @description save the storaged options
*/
function loadOptions() {
    // Load bookmarks
    getBookmarks();

    // Load settings
    storage.get('settings', function(items) {
        if(items.settings) {
            // Close tab
            $('input[name=closeTab]').attr('checked', items.settings[0]);
            // Keyboard shorcut
            $('input[name=keyboardShorcut]').attr('checked', items.settings[1]);
            fillInKeybinding1(items.settings[2]);
            fillInKeybinding2(items.settings[3]);
            toggleShorcut();
        }
    });
}

/**
* 
* @description save the current options
*/
function saveOptions() {
    var settingsArr = new Array();
    var keybind1 = $('#keyBind1');
    var keybind2 = $('#keyBind2');
    settingsArr.push($('input[name=closeTab]').prop('checked'));
    settingsArr.push($('input[name=keyboardShorcut]').prop('checked'));
    settingsArr.push(keybind1.find(":selected").text());
    settingsArr.push(keybind2.find(":selected").text());
    storage.set({'settings': settingsArr});

    $(document).bind('keypress', addShorcutListener(keybind1.find(":selected").val(),keybind2.find(":selected").val()));
}

/**
* 
* @description add key listener to the shorcut key
*/
function addShorcutListener(keybind1,keybind2) {
    if( event.which === keybind1 && keybind2) {
        alert('you pressed shorcut key');
    }
}

/**
* 
* @description create options for key binding 1
*/
function fillInKeybinding1(option) {
    var select = $('#keyBind1');
    var selectedOption = '';
    select.find('option').remove();
    var options = ['CTRL/CMD','ALT'];
    var values = ['(event.ctrlkey || event.cmdKey)','event.altkey'];
    for(var i = 0; i < options.length; i++) {
        if(options[i] == option) selectedOption = ' selected';
        else selectedOption = '';
        select.append('<option value="'+values[i]+'"'+selectedOption+'>'+options[i]+'</option>');
    }
}

/**
* 
* @description create options for key binding 2
*/
function fillInKeybinding2(option) {
    var select = $('#keyBind2');
    var selectedOption = '';
    select.find('option').remove();
    var options = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','Y','W','Z'];
    var values = 65;
    for(var i = 0; i < options.length; i++) {
        if(options[i] == option) selectedOption = ' selected';
        else selectedOption = '';
        select.append('<option value="'+values+'"'+selectedOption+'>'+options[i]+'</option>');
        values++;
    }
}

/**
* 
* @description change user's password
*/
function changePassword() {
    var message = $("#message");
	var pwdCurrentTxt = $('input[id=txtCurrentPassword]').val();
    var pwd = $('input[id=txtPassword]').val();
	var pwdConf = $('input[id=txtPasswordConf]').val();
    
	storage.get('pbPwd', function(items) {
		if (items.pbPwd) {
			if(items.pbPwd === pwdCurrentTxt) {
                if(pwd === pwdConf) {
                    storage.set({'pbPwd': pwd});
                    message.addClass("label label-success");
                    message.text(chrome.i18n.getMessage("password_changed"));
                } else {
                    message.addClass("label label-important");
                    message.text(chrome.i18n.getMessage("passwords_no_match"));
                }
			} else {
                message.addClass("label label-important");
				message.text(chrome.i18n.getMessage("wrongpassword"));
			}
		}
	});
}


/**
*
* @description backup bookmarks to JSON file file as well as all the options
*/
function backup() {
    var backup = {
        'date': new Date()
    };
    storage.get(['private','settings','pbPwd'], function(items) {
        if(items.private) {
            backup['bookmarks'] = items.private.clone();
        }
        if(items.settings) {
            backup['settings'] = items.settings.clone();
        }
        // Encrypt data
        if (items.pbPwd) {
            var encrypted_backup = Tea.encrypt(JSON.stringify(backup), items.pbPwd);
            $('#txtBackup').val(encrypted_backup);
        }
    });
}

/**
*
* @description restore the previous mentioned file
*/
function restore() {
    var loading = $('.loading');
    var error = false;
    loading.show();
    var restoreTxt = $('#txtRestore');
    var passwordTxt = $('#txtPwdRestore');
    // Decrypt data
    try {
        var decrypted = Tea.decrypt(restoreTxt.val(), passwordTxt.val());
        var restoreData = JSON.parse(decrypted);
        if (restoreData === undefined) {
            error = true;
        }
        // Restore settings
        if(restoreData.settings === undefined) {
            error = true;
        } else {
            // Close tab
            $('input[name=closeTab]').attr('checked', restoreData.settings[0]);
            // Keyboard shorcut
            $('input[name=keyboardShorcut]').attr('checked', restoreData.settings[1]);
            fillInKeybinding1(restoreData.settings[2]);
            fillInKeybinding2(restoreData.settings[3]);
            toggleShorcut();
            // Save options in the end
            saveOptions();
        }
        // Restore bookmarks
        if (restoreData.bookmarks === undefined) {
            error = true;
        } else {
            var dupe = bookmarksArray.concat(restoreData.bookmarks);
            bookmarksArray = dupe.clone().unique();
            // Save and set the bookmarks
            setBookmarks();
        }

        if(error) {
            makeAlert("errorrestoretitle","errorrestoremsg","alert-error");
        } else {
            makeAlert("successrestoretitle","successrestoremsg","alert-success");
        }

        // Misc
        restoreTxt.val('');
        passwordTxt.val('');
        loading.hide();
    } catch(err) {
        makeAlert("errorrestoretitle","errorrestoremsg","alert-error");
        loading.hide();
    }
}

/**
*
* @description display alert box on top of the page to the user
*/
function makeAlert(title,msg,type) {
    var alert = $('#alert-box');
    alert.addClass(type).show();
    $('#alertTitle').text(chrome.i18n.getMessage(title));
    $('#alertMsg').text(chrome.i18n.getMessage(msg));
    window.setTimeout(function() { alert.fadeOut() }, 10000);
}

/**
*
* @description perform a full reset: delete sync and local storage and restart extension
*/
function fullReset() {
    if(confirm(chrome.i18n.getMessage("askreset"))) {
        storage.clear();
        local.clear();
        window.close();
    }
}


/**
*
* @description document load
*/
$(document).ready(function() {
    // Show menu tabs
    $('#myTab a:first').tab('show');
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    
    // Hide alert box
    $("#alert-box").hide();

    // Check for user's session and load options
    local.get("pbSession", function(items) {
        if(items.pbSession) {
            // Add listeners to all components to save after any changes
            $('input[name=closeTab], input[name=keyboardShorcut], #keyBind1, #keyBind2, #keyBind3').on('change',saveOptions);
            $('input[name=keyboardShorcut]').on('change',toggleShorcut);
            $("#btnSet").click(changePassword);
            $("#btnRestore").click(restore);
            $("#btnSelectAll").click(selectAll);
            $("#btnInvertSelection").click(invertSelection);
            $("#btnDeleteBulk").click(deleteBookmarks);
            $("#btnReset").click(fullReset);
            $('a[data-toggle="tab"]').on('shown', function (e) {
                if(e.target.rel == 'backup')
                    backup();
            });
            loadOptions();
        } else {
            makeAlert("warningtitle","warningmsg","alert-error");
        }
    });

    translate();
});

