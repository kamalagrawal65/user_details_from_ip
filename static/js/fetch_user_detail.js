// do for user_id
var error = false;
var error_value = "";

current_url = window.location.href;
var entry_time = formatDate(new Date());

// Error Handling part
error_value = '';
error = true;

function formatDate(date) {
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	return day + '/' + monthIndex + '/' + year+' '+hour+':'+minute+':'+second;
}

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
pc.createDataChannel("");    //create a bogus data channel
pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
var myIP='';
let keepPromise = new Promise((resolve, reject) => {
	pc.onicecandidate = function(ice, myIP){  //listen for candidate events
		if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
		myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
		pc.onicecandidate = noop;
		resolve(myIP);
	};
});

keepPromise.then((res) => {
	myIP=res;
});

// On leaving page
window.onbeforeunload = function(e) {
  var leave_time = formatDate(new Date());
  $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/background',
		data: {
			'error' : error,
			'error_value' : error_value,
			'entry_time' : entry_time,
			'current_url' : current_url,
			'leave_time' : leave_time,
			'local_ip' : myIP
		}
  });
};


// Same url but hash changes
window.onhashchange = function(e) {
  var leave_time = formatDate(new Date());
  $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/background',
		data: {
			'error' : error,
			'error_value' : error_value,
			'entry_time' : entry_time,
			'current_url' : current_url,
			'leave_time' : leave_time,
			'local_ip' : myIP
		}
  });
  // as this becomes the new entry time
  entry_time = formatDate(new Date());
};