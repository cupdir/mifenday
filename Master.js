var Mi = require('./core/core.server.js');
Mi.mifenday({'store':{host:'10.237.39.164',port:6379}})
			.web()
			.start();
			