/*!
 * mifenday-node
 * Copyright(c) 2013 cupdir <cupdir@gmail.com>
 * Mi
 */
 var events = require('events'),
 	 util 	= require('util'),
 	 http 	= require('http'),
 	 url 	= require('url'),
 	 syslog  = 	require('../lib/log4js'),
 	 redis 	= require("../lib/redis"),
 	 io 	= require('../lib/socket.io').listen(9003);
var  client = queue = []; //用户推送队列 
function MiFen(options){
	this.logger();
	this.flush();
	this.options = options;
	redis.debug_mode = false;
	this.redis_client  = redis.createClient(options.store.port,options.store.host);
	this.redis_client.on('connect',function(){
		console.log('存储连接正常')
	});
	this.redis_client.on('error',function(err){
		console.log('Redis连接异常'+err);
		process.exit(1);
	})
	events.EventEmitter.call(this);
};
util.inherits(MiFen, events.EventEmitter); 
MiFen.prototype.s_reset = function(arr){
	if(arr.length >= 4){
		for(i=0;i<arr.length;i++){
			this.get_user(arr[i].id).count = '0';
		}
		return arr;
	}
};
MiFen.prototype.logger = function(){
  this.sign_log  = syslog.getLogger('3g-user-sign-log');
  this.interactive_log = syslog.getLogger('3g-user-interactive-log');
  var log_path = __dirname.substr(0,__dirname.length-4);
  syslog.configure({
        appenders: [
            {
                type: 'console'
            },
            {   
                type: 'dateFile', 
                absolute:true,
                filename: log_path+'logs/3g-sign.log', 
                category: '3g-user-sign-log'
            },
             {   
                type: 'dateFile', 
                absolute:true,
                filename: log_path+'logs/3g-interactive.log', 
                category: '3g-user-interactive-log'
            } 
        ]
    });
};
MiFen.prototype.start = function(){
	var self = this;
	io.sockets.on('connection',function(socket){
		//监听拉取用户数据
		socket.on('pull user',function(){
			console.log(socket.id+'客户端正在拉取用户数据');
			//socket.emit('user flush',self.s_reset(self.sort()));
		});
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
	});
};
MiFen.prototype.sort = function(){
	Array.prototype.s_filter = function(){
		for(i=0;i<this.length;i++){
			if(this[i].count <= 0){
				this.splice(i);
			}
		}
	};
	var sort_by = function(field, reverse, primer){ 
		reverse = (reverse) ? -1 : 1; 
		return function(a,b){ 
				    a = a[field]; 
				    b = b[field]; 
				    if ( typeof(primer) != 'undefined'){ 
					a = primer(a); 
					b = primer(b); 
				    } 
				    if (a<b) return reverse * -1; 
				    if (a>b) return reverse * 1; 
				    return 0; 
		} 
	}
	client.sort(sort_by('count',true,parseInt));
	var arr;
	if(client.length > 4){
			arr = client.slice(0,5);
			arr.s_filter();
			return arr;
	}
	return [];
	
};
//对外提供收集数据接口 GET
MiFen.prototype.web = function(){
	var self = this;
	var web = http.createServer(function(request,response){
		var get = [];
		var pathname = url.parse(request.url).pathname.match(/^\/([a-z]+)\/([0-9a-z]+)\/([0-9\w]+)\.([json|xml|string]+)$/g);
		if( request.method.toLowerCase() == 'get' ){
			if( pathname == null){
				response.writeHead(403, {'Content-Type': 'text/plain'});
				response.end();				
			}else{
				var req = pathname[0].split('.');
				get['token'] = req[0].split('/');
				get['output'] =  req[1].toLowerCase();
				get['token'].shift();
				var api = self.token(get['token'][0]); 
				if(typeof api != 'function'){
					response.writeHead(403, {'Content-Type': 'text/plain'});
					response.end();	
				}else{
					self.output(api(get['token'][1],get['token'][2]),response,get['output']);	
				}
			}
		}else{
			//405 Method Not Allowed
			response.writeHead(501, {'Content-Type': 'text/plain'});
			response.end();
		}
	});
	web.listen(8081);
	return this;
};
//http 输出方式
MiFen.prototype.output = function(obj,res,output){
	//text/xml
	var output = (typeof output != null)?output:'json';
	switch(output.toLocaleLowerCase()){
		case 'json':
			res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify(obj));
		break;
		case 'string':
			if(obj.length){
				res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
				res.end(obj);
			}else{
				res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
				res.end();
			}
		break;
		case 'xml':
			var xml = '<?xml version="1.0" encoding="ISO-8859-1"?><root><status>'+obj.status+'</status></root>';
			res.writeHead(200, {'Content-Type': 'text/xml; charset=ISO-8859-1'});
			res.end(xml);
		break;
		default:
		res.writeHead(404,{'Content-Type': 'text/plain'});
		res.end();

	}
};
//2秒清空互动数据
MiFen.prototype.flush = function(){
	var self = this;
	setInterval(function(){
			 for(i=0;i<client.length;i++){
			 	if(self.get_user(client[i].id).sign == false){
			 		if(self.get_user(client[i].id).count > 0){
			 			console.log('清空互动数据')
			 			self.get_user(client[i].id).count  = ((self.get_user(client[i].id).count - 5) < 0) ? 0 :self.get_user(client[i].id).count-5;
			 			console.log(client[i].id + '-' +client[i].count);			 			
			 		}

			 	}
			 }
	},500);
};
MiFen.prototype.get_user = function(user_id){
	if(client.length){
		for(i=0;i<client.length;i++){
			if(client[i].id == user_id){
				return client[i];
			}
		}
	}
	return false;
};
MiFen.prototype.set_user = function(obj){
	if(typeof(obj) !='object')return false;
	if(this.get_user(obj.id) == false){
		client.push(obj);
		return true;
	}
	return false;
};
//米粉互动接口
MiFen.prototype.token = function(key){
	var self = this;
	function reset(result){
			client = [];
			for(key in result){
				var obj = {};
				obj.id = key;
				obj.count = result[key];
				obj.sign = true;
				client.push(obj);
			}
	};
	function reponse(flag,id,count){
		return {status:'success',time:self.format('ssS'),user:{count:count,user_id:id}};

	};
	/////接口
	function _API(){
		//互动
		this.user = function(count,user_id){
				if(typeof(self.get_user(user_id)) == 'object'){
					console.log(user_id+'正在互动'+count);
					self.interactive_log.info(user_id+'|'+count)
					self.get_user(user_id).count = count;
					self.get_user(user_id).sign = false;
					return {status:'success',time:self.format('ssS'),user:{count:self.get_user(user_id).count,user_id:user_id}};

				}else{
					self.set_user({id:user_id,count:count,sign:false});
					return {status:'success',time:self.format('ssS'),user:{count:count,user_id:user_id}};
				}
			
		},
		this.get = function(param1,param2){
	
			var pull_interactive = pull_sign =  new Array();
			switch(param1){
				case 'interactive': //互动
					self.sort();
					for(i =0;i<client.length;i++){
						if(client[i].sign == false){
							pull_interactive.push(client[i]);
						}
					}
					return JSON.stringify(pull_interactive);
				break;
				case 'sign':
					for(i=0;i<client.length;i++){
						if(client[i].sign == true){
							pull_sign.push(client[i]);
						}
					}
					
					return JSON.stringify(pull_sign);	
				break;
				default:return '';
			}
		},
		//签到
		this.sign = function(sign_count,sign_user_id){
			if(self.get_user(sign_user_id)  ==  false){
				console.log(sign_user_id+'签到成功');
				self.sign_log.info(sign_user_id);
				self.set_user({id:sign_user_id,count:sign_count,sign:true});
				self.redis_client.hset("user_sign", sign_user_id,sign_count, self.redis_client.print);
				return {status:'success',time:self.format('ssS'),user:sign_user_id};
			}else{
				return {status:'fail auth sign',time:self.format('ssS')};
			}
		},
		//重新导入签到用户
		this.sos= function(){
			self.redis_client.hgetall('user_sign',function(err,result){
				reset(result);
			});
			return {status:'success',time:self.format('ssS')}

		};
		this.monitor = function(){
			return {status:'success',time:self.format('ssS'),count:client};
		};
	};
	var token = new _API();
	return (typeof token[key] == 'function' ) ? token[key]:{};
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