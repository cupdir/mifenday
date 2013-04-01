var Mi = require('./core/slave.server.js');
Mi.mifenday({'store':{host:'10.237.39.164',port:6379}})
			.web()
			.start();
			