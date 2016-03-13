var domInspector = (function (document) {

    var last = null;
    var domClickCallback = null;

    /**
    * MouseOver action for all elements on the page:
    */
    function inspectorMouseOver(e) {
        var element = e.target;

        // Set outline:
        element.style.outline = '2px solid #f00';

        // Set last selected element so it can be 'deselected' on cancel.
        last = element;
    }


    /**
     * MouseOut event action for all elements
     */
    function inspectorMouseOut(e) {
        // Remove outline from element:
        e.target.style.outline = '';
    }


    /**
     * Click action for hovered element
     */
    function inspectorOnClick(e) {
        e.preventDefault();

        console.log(e.target);

        return false;
    }

    function cancelInspector() {
        document.removeEventListener("mouseover", inspectorMouseOver, true);
        document.removeEventListener("mouseout", inspectorMouseOut, true);
        document.removeEventListener("click", domClickCallback, true);
        document.removeEventListener("keydown", inspectorCancel, true);

        // Remove outline on last-selected element:
        last.style.outline = 'none';
    }

    /**
    * Function to cancel inspector:
    */
    function inspectorCancel(e) {
        if (e.which === 27) {
            cancelInspector();
        }
    }

    function inspect() {
        document.addEventListener("mouseover", inspectorMouseOver, true);
        document.addEventListener("mouseout", inspectorMouseOut, true);
        document.addEventListener("click", domClickCallback, true);
        document.addEventListener("keydown", inspectorCancel, true);
    }

    return {
        inspect: function (callback) {
            domClickCallback = callback;
            inspect();
        },
        cancel: cancelInspector
    };

}(document));

function sendMessage(inspectedElement) {
    var inputIds = [];
    var inputNames = [];
    var inputClasses = [];
    var anonymousInputs = [];

    var inputs = inspectedElement.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        prepareData(inputs[i]);
    }

    function prepareData(element) {
        if (element.id) {
            inputIds.push(element.id);
        } else if (element.getAttribute("name")) {
            if (inputNames.indexOf(element.getAttribute("name")) === -1) {
                inputNames.push(element.getAttribute("name"));
            }
        } else if (element.className) {
            // Concatinate multiple classes with dot.
            inputClasses.push(element.className.replace(/ /g, "."));
        } else {
            anonymousInputs.push(element.outerHTML);
        }
    }

    var data = {
        compName: inspectedElement.id || inspectedElement.getAttribute("name"),
        inputIds: inputIds,
        inputNames: inputNames,
        inputClasses: inputClasses,
        anonymousInputs: anonymousInputs
    };

    chrome.extension.sendMessage(data);
}

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    domInspector.inspect(function (e) {
        e.preventDefault();
        e.stopPropagation();
        domInspector.cancel();
        sendMessage(e.target);
    });
});