// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var stateMap = initStateMap();





// When the user clicks on the button, open the modal
console.log(btn);
btn.onclick = function () {
    modal.style.display = "block";
}

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




function buildTruckTable(trucks) {
    makeRequest('GET', "http://localhost:8080/trucks").then((response) => {
        let trucks = JSON.parse(response);

        trucks.forEach((truck, index) => {
            //create <tr>
            let trElement = document.createElement('tr');
            //create <td> elements
            let tdElement = document.createElement('td');
            tdElement.innerText = index + 1;
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = truck['truckId'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = truck['driverFirstName'] + ' ' + truck['driverLastName'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = 'MB Status';
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            let assignButton = document.createElement('input');
            assignButton.type = 'button';
            assignButton.value = 'Assign Call';
            assignButton.classList.add('btn', 'btn-primary');
            tdElement.appendChild(assignButton);
            trElement.appendChild(tdElement);
            document.querySelector("#truck_table tbody").appendChild(trElement);
        });
    });
}

function buildCallsTable(trucks) {
    makeRequest('GET', "http://localhost:8080/calls").then((response) => {
        let calls = JSON.parse(response);
        console.log(calls);
        calls.forEach((call, index) => {
            //create <tr>
            let trElement = document.createElement('tr');
            //create <td> elements
            let tdElement = document.createElement('td');
            tdElement.innerText = index + 1;
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['id'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call.customer['firstName'] + ' ' + call.customer['lastName'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['dropOffLocation'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['pickUpLocation'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['truckId']
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            let assignButton = document.createElement('button');
            assignButton.type = 'button';
            assignButton.innerText = 'Assign Truck';
            assignButton.classList.add('btn', 'btn-primary');
            assignButton.addEventListener('click', () => {
                alert("Joe Sucks");
            });
            tdElement.appendChild(assignButton);
            trElement.appendChild(tdElement);
            document.querySelector("#call_table tbody").appendChild(trElement);
        });
    });
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
    if (status == 'READY')
        icon = greenIcon;
    else if (status == 'TRAVEL')
        icon = redIcon;
    else if (status == 'UNLOAD')
        icon = blueIcon;
    L.marker(location,
        {
            icon: icon,
            keyboard: false,
            title: status
        }).addTo(map)
        .bindPopup('Truck: ' + truckNumber + '<br>Status: ' + status);
}

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

let initializePage = () => {
    buildTruckTable();
    buildCallsTable();
}

initializePage();