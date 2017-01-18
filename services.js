// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var stateMap = initStateMap();


// When the user clicks on the button, open the modal
console.log(btn);
// btn.onclick = function () {
// modal.style.display = "block";
// }

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

let callService = {
    getCallById: function (callId) {
        let url = "http://localhost:8080/calls/2";
        let xhr = createCORSRequest('GET', url, () => {
            let response = xhr.responseText;
            console.log(response);
        });

        xhr.send();
    }
}

function initStateMap() {
	var stateMap = L.map('stateMap').setView([41.587972289460076, -93.6332130432129], 12);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(stateMap);
	
	addTruckToMap(stateMap, 1, 'READY', [41.624424, -93.744167]);
	addTruckToMap(stateMap, 2, 'TRAVEL', [41.549948, -93.620258]);
	
	return stateMap;
}

function addTruckToMap(map, truckNumber, status, location) {
	var icon;
	if(status == 'READY')
		icon = greenIcon;
	else if(status == 'TRAVEL')
		icon = redIcon;
	else if(status == 'UNLOAD')
		icon = blueIcon;
	L.marker(location,
		{icon: icon,
		keyboard: false,
		title: status
		}).addTo(map)
		.bindPopup('Truck: '+truckNumber+'<br>Status: '+status); 
}


let createCORSRequest = function (method, url, successCallback) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    xhr.onload = successCallback;
    return xhr;
}