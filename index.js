var fs = require("fs");
var htmlencode = require("htmlencode").htmlEncode;

var CodeAnnotation = function () {};

const getUid = (req) => {
  return parseInt(
    (req.body.user_id || req.query.uid || "0").match(/\d+/g).join("")
  );
};

CodeAnnotation.addToHead = function (params) {
  return (
    '<link href="/static/codeannotation/style.css" rel="stylesheet">\n' +
    '<link href="/static/codeannotation/prism.css" rel="stylesheet">\n' +
    '<script src="/static/codeannotation/prism.js" data-manual type="text/javascript"></script>\n' +
    '<script src="/static/codeannotation/codeAnnotation.js" type="text/javascript"></script>\n'
  );
};

CodeAnnotation.addToBody = function (params) {
  return "";
};

CodeAnnotation.initialize = function (req, params, handlers, cb) {
  // get uid for logging
  params.u = getUid(req);

  // Initialize the content type
  params.headContent += CodeAnnotation.addToHead(params);
  params.bodyContent += CodeAnnotation.addToBody(params);

  // Initialize the content package
  // prettier-ignore
  handlers.contentPackages[req.params.contentPackage].initialize(req, params, handlers, function() {
    cb();
  });
};

// prettier-ignore
CodeAnnotation.handleEvent = function(event, payload, req, res, protocolPayload, responseObj, cb) {
  var dir = CodeAnnotation.config.logDirectory + '/code-annotation'
  if (event === 'log') {
    fs.mkdir(dir, 0775, function(err) {
      var name = payload.id.replace(/\.|\/|\\|~/g, "-") + '.log';
      var data = new Date().toISOString() + ' ' + JSON.stringify(payload) + ' ' + JSON.stringify(protocolPayload || {}) + '\n';
      fs.writeFile(dir + '/' + name, data, { flag: 'a' }, function(err) {
        cb(event, payload, req, res, protocolPayload, responseObj);
      });
    });
  } else {
    cb(event, payload, req, res, protocolPayload, responseObj);
  }
};

CodeAnnotation.register = function (handlers, app, conf) {
  handlers.contentTypes.codeannotation = CodeAnnotation;
  fs.mkdir(conf.logDirectory + "/code-annotation", 0775, function (err) {});
  CodeAnnotation.config = conf;
};

CodeAnnotation.namespace = "codeannotation";
CodeAnnotation.installedContentPackages = [];
CodeAnnotation.packageType = "content-type";

CodeAnnotation.meta = {
  name: "code-annotation",
  shortDescription: "",
  description: "",
  author: "Peter Sormunen",
  license: "MIT",
  version: "0.0.1",
};

module.exports = CodeAnnotation;
