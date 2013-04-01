
var client = [];
var o  = { '178242780': '0',
  '178242781': '0',
  '178242782': '0',
  '178242783': '0',
  '178242784': '0',
  '178242785': '0',
  '178242786': '0',
  '178242787': '0',
  '178242788': '0',
  '178242789': '0',
  '1782427810': '0',
  '1782427811': '0',
  '1782427812': '0',
  '1782427813': '0',
  '1782427814': '0',
  '1782427815': '0',
  '1782427816': '0',
  '1782427817': '0',
  '1782427818': '0',
  '1782427819': '0' }

 var i=0;
 for(key in o ){
 	 var obj = {};
 	obj.id = key
 	obj.count = o[key]
 	client[i++] = obj;
 }
 console.log(client)
// var client = [{id: "178242784", count: "1"} ,{id: "178242784", count: "4"} ,{id: "178242784", count: "3"} ,{id: "178242784", count: "2"} ,{id: "178242784", count: "1"} ]
// //var client = []


// function get_user(user_id){
// 	if(client.length){
// 		for(i=0;i<client.length;i++){
// 			if(client[i].id == user_id){
// 				return client[i];
// 			}
// 		}
// 	}
// 	return false;
// }
// function set_user(obj){
// 	if(typeof(obj) !='object')return false;
// 	if(get_user(obj.id) == false){
// 		client.push(obj);
// 		return true;
// 	}
// 	return false;
// }
//console.log(get_user('178242784'))
//console.log(set_user({id:'1231231',count:31}))

//console.log(client)
// Array.prototype.filter = function(){
// 	for(i=0;i<this.length;i++){
// 		if(this[i].count <= 0){
// 			this.splice(i);
// 		}
// 	}
// };
// Array.prototype.s_zore = function(){
// 	for(i=0;i<=4;i++){
// 		this[i].count = 0;
// 	}
// };
// var sort_by = function(field, reverse, primer){ 
// 		reverse = (reverse) ? -1 : 1; 
// 		return function(a,b){ 
// 				    a = a[field]; 
// 				    b = b[field]; 
// 				    if (typeof(primer) != 'undefined'){ 
// 					a = primer(a); 
// 					b = primer(b); 
// 				    } 
// 				    if (a<b) return reverse * -1; 
// 				    if (a>b) return reverse * 1; 
// 				    return 0; 
// 		} 
// 	}
// 	sort.sort(sort_by('count',true,parseInt));
// 	var arr;
// 	if(sort.length > 4){
// 			arr = sort.slice(0,5);
// 			arr.filter();
			
// 	}
// 	if(arr.length> 4){
// 		console.log(arr)
// 		sort.s_zore();
// 	}


		