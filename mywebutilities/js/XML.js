var XML=new Object;
XML.newDocument = function(rootTagName) {
    if (!rootTagName) rootTagName = "";
    if (document.implementation && document.implementation.createDocument) {
        return document.implementation.createDocument("", rootTagName, null);
    }
    else {
        var doc = new ActiveXObject("MSXML2.DOMDocument");
        if (rootTagName) {
            var text = "<" + rootTagName + "/>";
            doc.loadXML(text);
        }
        return doc;
    }
};
XML.serialize = function(node) {
    if (typeof XMLSerializer != "undefined")
    return (new XMLSerializer( )).serializeToString(node);
    else if (node.xml) return node.xml;
    else throw "XML.serialize is not supported or can't serialize " + node;
};

