
// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "panel"
});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

backgroundPageConnection.onMessage.addListener(function (message, sender, sendResponse) {
    document.getElementById("btnInspect").removeAttribute('disabled');
    document.getElementById("compName").innerText = message.compName;
    document.getElementById("result").value = parseIds(message.inputIds);
    document.getElementById("result").value += parseNames(message.inputNames);
    document.getElementById("result").value += parseClasses(message.inputClasses);
    document.getElementById("result").value += "\n---------------------\n";
    document.getElementById("result").value += message.anonymousInputs.join('\n');
});

function parseClasses(classes) {
    var result = '';
    for (i = 0; i < classes.length; i++) {
        result += 'var ' + classes[i] + ' = ".' + classes[i] + '";\n';
    }

    return result;
}

function parseIds(ids) {
    var result = '';
    for (i = 0; i < ids.length; i++) {
        result += 'var ' + ids[i] + ' = "#' + ids[i] + '";\n';
    }
    
    return result;
}

function parseNames(names) {
    var result = '';
    for (i = 0; i < names.length; i++) {
        var name = "input[name='']"
        result += 'var ' + names[i] + ' = "input[name=\'' + names[i] + '\']";\n';
    }

    return result;
}

document.getElementById("btnInspect").addEventListener("click", function (e) {
    e.target.setAttribute('disabled', 'disabled');
    backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        action: "InspectElement",
    });
});