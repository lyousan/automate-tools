const xmldoc = require("xmldoc");
const fs = require("fs");
const nodeCache = new Map();
let originXml = '';
const loadDoc = (filepath) => {
    nodeCache.clear();
    originXml = fs.readFileSync(filepath, {encoding: "utf-8"})
    let doc = new xmldoc.XmlDocument(originXml);
    parseDoc(doc, null);
    return nodeCache;
}

const getOriginXml = () => {
    return originXml;
}


function parseDoc(doc, parent, index) {
    let xpath = parent ? parent.xpath : '';
    xpath += `/node[${index ? (index + 1) : 1}]`;
    let node = {
        'resourceId': doc.attr['resources-id'],
        'class': doc.attr['class'],
        'text': doc.attr['text'],
        'contentDesc': doc.attr['content-desc'],
        'checkable': doc.attr['checkable'],
        'checked': doc.attr['checked'],
        'clickable': doc.attr['clickable'],
        'editable': doc.attr['editable'],
        'enabled': doc.attr['enabled'],
        'focusable': doc.attr['focusable'],
        'focused': doc.attr['focused'],
        'scrollable': doc.attr['scrollable'],
        'longClickable': doc.attr['long-clickable'],
        'password': doc.attr['password'],
        'selected': doc.attr['selected'],
        'bounds': doc.attr['bounds'],
        'cacheId': doc.attr['cacheId'],
        'parentId': parent && parent['cacheId'],
        'xpath': xpath
    }
    nodeCache.set(doc.attr['cacheId'], node);
    // console.log('node: ', node);
    let children = doc.childrenNamed("node");
    if (children && children.length > 0) {
        children.forEach((child, index) => {
            parseDoc(child, node, index);
        })
    }
}

module.exports = {
    loadDoc,
    getOriginXml
}
