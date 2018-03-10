/*******************************************************
 * service: disco registry
 * module: bind another service
 * Mike Amundsen (@mamund)
 *******************************************************/

// handles HTTP resource operations 
var registry = require('./../components/registry.js');
var utils = require('./utils.js');
var wstl = require('./../wstl.js');
var gTitle = "DISCO Registry";
var config = require('./../config.js');

module.exports = main;

function main(req, res, parts, respond) {

  switch (req.method) {
  case 'GET':
    sendPage(req, res, respond);
    break;
  case 'POST':
    postBind(req, res, respond);
    break;
  default:
    respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
    break;
  }
}

function postBind(req, res, respond) {
  var body, doc, msg;

  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      if(msg.sourceRegID && msg.targetRegID) {
        var dt = new Date();
        var token = config.registryKey + ":"+msg.sourceRegID+":"+msg.targetRegID+":"+dt.toUTCString();
        msg.bindToken = "simple:"+Buffer.from(token).toString('base64');
        console.log(token);
        console.log(msg);
        console.log(Buffer.from(msg.bindToken.substring(7),'base64').toString('ascii'));
      }
      else {
        doc.type="error"
        doc.message="Not Found";
        doc.code = 404;
      }      
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
   }

    respond(req, res, {code:200, doc:(!doc?"":doc), 
      headers:{'location':'//'+req.headers.host+"/find/?id="+msg.id}
    });
  });
}

function sendPage(req, res, respond) {
  var doc, coll, root, data, related, content;

  root = 'http://'+req.headers.host;
  coll = [];
  data = [];
  related = {};
  content = "";
  
  coll = wstl.append({name:"dashboard",href:"/",rel:["self", "home", "dashboard", "collection"], root:root},coll);
  coll = wstl.append({name:"registerLink",href:"/reg/",rel:["create-form", "register", "reglink"], root:root},coll);
  coll = wstl.append({name:"unregisterLink",href:"/unreg/",rel:["delete-form", "unregister", "unreglink"], root:root},coll);
  coll = wstl.append({name:"renewLink",href:"/renew/",rel:["edit-form", "renew", "renewlink"], root:root},coll);
  coll = wstl.append({name:"findLink",href:"/find/",rel:["search", "find", "findlink"], root:root},coll);
  coll = wstl.append({name:"bindLink",href:"/bind/",rel:["search", "bind", "bindlink"], root:root},coll);

  coll = wstl.append({name:"bindForm", href:"/bind/",rel:["edit-form", "bind", "bindform"], root:root},coll);
  
  content =  '<div>';
  content += '<h2>Bind a Service</h2>';
  content += '</div>';
  
  // compose graph 
  doc = {};
  doc.title = gTitle;
  doc.data =  data;
  doc.actions = coll;
  doc.content = content;
  doc.related = related;

  // send the graph
  respond(req, res, {
    code : 200,
    doc : {
      disco : doc
    }
  });
  
}

// EOF

