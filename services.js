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
    let modal = document.getElementById(modalId);
    modal.style.display = "none";
}

var domain = 'https://perrystowingserver.herokuapp.com';
if (location.hostname == 'localhost' || location.hostname == '127.0.0.1') {
    domain = "http://localhost:8080"
}

function assignTruck(clicker) {
    let selector = document.getElementById('truck_selector');
    let truckId = selector.options[selector.selectedIndex].value;
    let callId = document.getElementById('assign_truck_submit').dataset.callid;
    let assign_truck_modal = document.getElementById('assign_truck_modal');
    makeRequest('POST', "/calls/assign/" + callId + "/" + truckId).then(() => {
        initializePage();
        closeModal(assign_truck_modal.id);
    });
}


function unAssignTruck(clicker) {
    let callId = document.getElementById('assign_truck_submit').dataset.callid;
    let assign_truck_modal = document.getElementById('assign_truck_modal');
    makeRequest('POST', "/calls/unassign/" + callId).then(() => {
         initializePage();
        closeModal(assign_truck_modal.id);
    });
}

function assignCall(clicker) {
    let selector = document.getElementById('call_selector');
    let callId = selector.options[selector.selectedIndex].value;
    let truckId = document.getElementById('assign_call_submit').dataset.truckid;
    let assign_call_modal = document.getElementById('assign_call_modal');
    makeRequest('POST', "/calls/assign/" + callId + "/" + truckId).then((call) => {
        // updateRow('truck_table', 'truck_row_' + truckId, JSON.parse(call));
        initializePage();
        closeModal(assign_call_modal.id);
    });
}

function updateRow(tableId, rowId, data) {
    let table_to_update = document.getElementById(tableId);
    let row_to_update = table_to_update.querySelector('#' + rowId);

    // table_to_update.replaceChild( , row_to_update);

}

function buildTruckTable() {
    makeRequest('GET', "/trucks").then((response) => {
        let trucks = JSON.parse(response);
        let truck_table_tbody = document.querySelector("#truck_table tbody");
        removeChildNodes(truck_table_tbody);


        trucks.forEach((truck, index) => {
            // addTruckToMap(map, truckNumber, status, location)
            addTruckToMap(stateMap,
                truck.identifier,
                truck.truckStatusType, 
                [parseFloat(truck.gisLatitude, 10), parseFloat(truck.gisLongitude, 10)]);

            //create <tr>
            let trElement = document.createElement('tr');
            trElement.id = "truck_row_" + (index + 1);
            //create <td> elements
            let tdElement = document.createElement('td');
            tdElement.innerText = index + 1;
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = truck['identifier'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = truck['driverFirstName'] + ' ' + truck['driverLastName'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = 'MB Status';
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = truck['numberOfCalls'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            let assignButton = document.createElement('input');
            assignButton.type = 'button';
            assignButton.value = 'Assign Call';
            assignButton.classList.add('btn', 'btn-primary');
            assignButton.addEventListener('click', () => {
                openAssignCallModal(truck['id']);
            });
            assignButton.id = "assign_call_button_" + index;
            assignButton.style.cursor = "pointer";

            tdElement.appendChild(assignButton);
            trElement.appendChild(tdElement);
            truck_table_tbody.appendChild(trElement);
        });
    });
}

function removeChildNodes(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function openAssignCallModal(truckId) {
    makeRequest('GET', '/calls/available').then((calls) => {
        calls = JSON.parse(calls);
        let assign_call_modal = document.getElementById('assign_call_modal');
        assign_call_modal.style.display = "block";
        let call_selector = document.getElementById('call_selector');
        call_selector.options.length = 0;
        calls.forEach((call) => {
            let option = document.createElement("option");
            option.value = call['id'];
            option.innerText = call['id'] + ": " + call.customer['firstName'] + " " + call.customer['lastName'];
            call_selector.appendChild(option);
        });
        let assign_call_submit = document.getElementById("assign_call_submit")
        assign_call_submit.dataset.truckid = truckId;
    });
}

function buildCallsTable() {
    makeRequest('GET', "/calls").then((response) => {
        let calls = JSON.parse(response);
        let call_table_tbody = document.querySelector("#call_table tbody");
        removeChildNodes(call_table_tbody);
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
            tdElement.innerText = call['pickUpLocation'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['dropOffLocation'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['truckId'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            let assignButton = document.createElement('button');
            assignButton.type = 'button';
            assignButton.innerText = 'Assign Truck';
            assignButton.classList.add('btn', 'btn-primary');
            if (call['truckId'] != 0) {
                assignButton.classList.remove('btn-primary');
                assignButton.classList.add('btn-warning');
                assignButton.innerText = 'Re-Assign';
            }
            assignButton.addEventListener('click', () => {
                openAssignTruckModal(call['id']);
            });
            assignButton.id = "assign_truck_button_" + index;
            assignButton.style.cursor = "pointer";

            tdElement.appendChild(assignButton);
            trElement.appendChild(tdElement);
            call_table_tbody.appendChild(trElement);
        });
    });
}

function openAssignTruckModal(callId) {
    makeRequest('GET', '/trucks').then((trucks) => {
        trucks = JSON.parse(trucks);
        let truck_modal = document.getElementById('assign_truck_modal');
        truck_modal.style.display = "block";
        let truck_selector = document.getElementById('truck_selector');
        truck_selector.options.length = 0;
        trucks.forEach((truck) => {
            let option = document.createElement("option");
            option.value = truck["id"];
            option.innerText = truck["identifier"] + ": " + truck['driverFirstName'] + " " + truck['driverLastName'];
            truck_selector.appendChild(option);
        });
        let assign_truck_submit = document.getElementById("assign_truck_submit")
        assign_truck_submit.dataset.callid = callId;
    });
}

function initStateMap() {
    var stateMap = L.map('stateMap', {
        center: [41.587972289460076, -93.6332130432129],
        zoom: 12,
        minZoom: 8,
        maxZoom: 16
    });
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(stateMap);

    // addTruckToMap(stateMap, 1, 'READY', [41.624424, -93.744167]);
    // addTruckToMap(stateMap, 2, 'TRAVEL', [41.549948, -93.620258]);

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
    else
        icon = greyIcon;
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

let stateMap;

let initializePage = () => {
    stateMap = initStateMap();
    buildTruckTable();
    buildCallsTable();
}

initializePage();