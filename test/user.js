var http = require('http');
for(i=0;i<1000;i++){
	var options = {
	  hostname: '127.0.0.1',
	  port: 8080,
	  path: '/user/'+(i + Math.floor(Math.random()*10)) +'/17824278'+i+'.json',
	  method: 'GET'
	};
	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	    console.log('BODY: ' + chunk);
	  });
	});	
	req.end();
}