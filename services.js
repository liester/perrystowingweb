var stateMap = initStateMap();


window.onclick = function (event) {
    let assign_truck_modal = document.getElementById('assign_truck_modal');
    let assign_call_modal = document.getElementById('assign_call_modal');
    if (event.target == assign_truck_modal) {
        assign_truck_modal.style.display = "none";
    } else if (event.target == assign_call_modal) {
        assign_call_modal.style.display = "none";
    }
}

function closeModal(modalId) {
    let assign_modal = document.getElementById(modalId);
    assign_modal.style.display = "none";
}

var domain = 'https://perrystowingserver.herokuapp.com';
if (location.hostname == 'localhost' || location.hostname == '127.0.0.1') {
    domain = "http://localhost:8080"
}

let callService = {
    getCallById: function (callId) {
        let url = "/calls/2";
        let xhr = createCORSRequest('GET', url, () => {
            let response = xhr.responseText;
            console.log(response);
        });

        xhr.send();
    }
}

function assignTruck() {
    let selector = document.getElementById('truck_selector');
    let truckId = selector.options[selector.selectedIndex].value;
    document.getElementById('assign_truck_modal').style.display = "none";
    // makeRequest('POST', "/calls/assignTruck/" + truckId).then(() => {});
}


function buildTruckTable(trucks) {
    makeRequest('GET', "/trucks").then((response) => {
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
            assignButton.addEventListener('click', () => {
                openCallModal();
            });

            tdElement.appendChild(assignButton);
            trElement.appendChild(tdElement);
            document.querySelector("#truck_table tbody").appendChild(trElement);
        });
    });
}

function openCallModal() {
    makeRequest('GET', '/calls').then((calls) => {
        calls = JSON.parse(calls);
        let create_call_modal = document.getElementById('assign_call_modal');
        create_call_modal.style.display = "block";
        let call_selector = document.getElementById('call_selector');
        call_selector.options.length = 0;
        calls.forEach((call) => {
            let option = document.createElement("option");
            option.value = call['id'];
            option.innerText = call['id'] + ": " + call.customer['firstName'] + " " + call.customer['lastName'];
            call_selector.appendChild(option);
        });

        console.log(calls);
    });
}

function buildCallsTable(trucks) {
    makeRequest('GET', "/calls").then((response) => {
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
                openTruckModal();
            });
            tdElement.appendChild(assignButton);
            trElement.appendChild(tdElement);
            document.querySelector("#call_table tbody").appendChild(trElement);
        });
    });
}

function openTruckModal() {
    makeRequest('GET', '/trucks').then((trucks) => {
        trucks = JSON.parse(trucks);
        let truck_modal = document.getElementById('assign_truck_modal');
        truck_modal.style.display = "block";
        let truck_selector = document.getElementById('truck_selector');
        truck_selector.options.length = 0;
        trucks.forEach((truck) => {
            let option = document.createElement("option");
            option.value = truck["truckId"];
            option.innerText = truck["truckId"] + ": " + truck['driverFirstName'] + " " + truck['driverLastName'];
            truck_selector.appendChild(option);
        });
        console.log(trucks);
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
    L.marker(location, {
            icon: icon,
            keyboard: false,
            title: status
        }).addTo(map)
        .bindPopup('Truck: ' + truckNumber + '<br>Status: ' + status);
}

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        url = domain + url;
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