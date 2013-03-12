/*!
 * mifenday-node
 * Copyright(c) 2013 cupdir <cupdir@gmail.com>
 * Mi
 */
 var events = require('events'),
 	 util 	= require('util'),
 	 io 	= require('../lib/socket.io').listen(9001);
var client =  queue = [];
function MiFen(options){
	this.options = options;
	events.EventEmitter.call(this);
};

util.inherits(MiFen, events.EventEmitter); 

MiFen.prototype.start = function(){
	var self = this;
	io.sockets.on('connection',function(socket){
		var event_callback_object = {time : self.format('yyMMddHHmmss'),connections :self.formatConnected(socket.manager.connected )};
		socket.emit('user connected',event_callback_object); //连接成功
		socket.on('disconnect',function(){
			socket.emit('disconnect');
			io.sockets.emit('user disconnected',event_callback_object);
			console.log('服务端连接终端');
		});
		socket.on('message', function () {
			console.log('消息')
		});
		//socket.emit('connections_count',io.sockets.manager.server.connections);
	});
};
//计算连接客户端数量
MiFen.prototype.formatConnected = function(connected){
	var count=0;
	if(typeof connected != 'object')return 0;
	for(key in connected){
		if(connected[key] == true){
			count++;
		}
	}
	return count;
};
MiFen.prototype.format=function(fmt) {
    time = new Date();      
    var o = {        
    	"M+" : time.getMonth()+1, //月份        
        "d+" : time.getDate(), //日        
        "h+" : time.getHours()%12 == 0 ? 12 : time.getHours()%12, //小时        
        "H+" : time.getHours(), //小时        
        "m+" : time.getMinutes(), //分        
        "s+" : time.getSeconds(), //秒        
        "q+" : Math.floor((time.getMonth()+3)/3), //季度        
        "S" : time.getMilliseconds() //毫秒        
        };        
        var week = {        
        "0" : "\u65e5",        
        "1" : "\u4e00",        
        "2" : "\u4e8c",        
        "3" : "\u4e09",        
        "4" : "\u56db",        
        "5" : "\u4e94",        
        "6" : "\u516d"       
        };        
        if(/(y+)/.test(fmt)){        
            fmt=fmt.replace(RegExp.$1, (time.getFullYear()+"").substr(4 - RegExp.$1.length));        
        }        
        if(/(E+)/.test(fmt)){        
            fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);        
        }        
        for(var k in o){        
            if(new RegExp("("+ k +")").test(fmt)){        
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));        
            }        
        }        
        return fmt;        
};
exports.mifenday = function(options){
	return new MiFen(options);
}