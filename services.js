window.onclick = function (event) {
    let assign_truck_modal = document.getElementById('assign_truck_modal');
    let assign_call_modal = document.getElementById('assign_call_modal');
    let create_call_modal = document.getElementById('create_call_modal');
    if (event.target == assign_truck_modal) {
        assign_truck_modal.style.display = "none";
    } else if (event.target == assign_call_modal) {
        assign_call_modal.style.display = "none";
    } else if (event.target == create_call_modal) {
        create_call_modal.style.display = "none";
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
        refreshData();
        closeModal(assign_truck_modal.id);
    });
}


function unAssignTruck(clicker) {
    let callId = document.getElementById('assign_truck_submit').dataset.callid;
    let assign_truck_modal = document.getElementById('assign_truck_modal');
    makeRequest('POST', "/calls/unassign/" + callId).then(() => {
        refreshData();
        closeModal(assign_truck_modal.id);
    });
}

function assignCall(clicker) {
    let selector = document.getElementById('call_selector');
    let callId = selector.options[selector.selectedIndex].value;
    let truckId = document.getElementById('assign_call_submit').dataset.truckid;
    let assign_call_modal = document.getElementById('assign_call_modal');
    makeRequest('POST', "/calls/assign/" + callId + "/" + truckId).then((call) => {
        refreshData();
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
            tdElement.innerText = truck['truckStatusType'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = truck['dropOffLocation'] || 'None';
            trElement.appendChild(tdElement);

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
    makeRequest('GET', "/calls/nonComplete").then((response) => {
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
            let vehicle = call.customer.vehicle;
            tdElement.innerText = vehicle['year'] + ' ' + vehicle['make'] + ' ' + vehicle['model'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['pickUpLocation'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['dropOffLocation'];
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.classList.add('nowrap');
            let callTime = moment.unix(call['insertTime'])
            tdElement.innerText = callTime.format('MMM Do h:mm:ss a');
            trElement.appendChild(tdElement);

            tdElement = document.createElement('td');
            tdElement.innerText = call['truckIdentifier'];
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

            let editIcon = document.createElement('i');
            editIcon.classList.add('fa');
            editIcon.classList.add('fa-pencil-square-o');
            editIcon.style.cssFloat = 'right';
            editIcon.style.marginRight = '2em';

            let span = document.createElement('span');
            span.addEventListener('click', () => {
                openEditCallModal(call['id']);
            });
            span.style.cursor = "pointer";
            span.appendChild(editIcon);

            tdElement.appendChild(assignButton);
            tdElement.appendChild(span);
            tdElement.classList.add('nowrap');
            trElement.appendChild(tdElement);
            call_table_tbody.appendChild(trElement);
        });
    });
}

function openAssignTruckModal(callId) {
    makeRequest('GET', '/trucks/available').then((trucks) => {
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


function openCreateCallModal() {
    let create_call_modal = document.getElementById('create_call_modal');
    document.getElementById('call_id_input').value = "";
    document.getElementsByName('customer.firstName')[0].value = "";
    document.getElementsByName('customer.lastName')[0].value = "";
    document.getElementsByName('customer.phoneNumber')[0].value = "";
    document.getElementsByName('customer.priceQuote')[0].value = "";
    document.getElementsByName('pickUpLocation')[0].value = "";
    document.getElementsByName('dropOffLocation')[0].value = "";
    document.getElementsByName('customer.vehicle.make')[0].value = "";
    document.getElementsByName('customer.vehicle.model')[0].value = "";
    document.getElementsByName('customer.vehicle.year')[0].value = "";
    document.getElementsByName('customer.vehicle.color')[0].value = "";
    document.getElementsByName('customer.vehicle.licensePlateNumber')[0].value = "";
    document.getElementById('delete_call_submit').style.display = "none";
    let create_call_submit = document.getElementById('create_call_submit');
    create_call_submit.innerHTML = "<i class='fa fa-check' aria-hidden='true'>&nbsp;</i>Create";
    create_call_submit.onclick = createCall;
    create_call_modal.style.display = "block";

}


function openEditCallModal(callId) {
    makeRequest('GET', '/calls/' + callId).then((callString) => {
        let call = JSON.parse(callString);
        let create_call_modal = document.getElementById('create_call_modal');
        document.getElementById("call_id_input").value = call.id;
        document.getElementsByName('customer.firstName')[0].value = call.customer.firstName;
        document.getElementsByName('customer.lastName')[0].value = call.customer.lastName;
        document.getElementsByName('customer.phoneNumber')[0].value = call.customer.phoneNumber;
        document.getElementsByName('customer.priceQuote')[0].value = call.customer.priceQuote;
        document.getElementsByName('pickUpLocation')[0].value = call.pickUpLocation;
        document.getElementsByName('dropOffLocation')[0].value = call.dropOffLocation;
        document.getElementsByName('customer.vehicle.make')[0].value = call.customer.vehicle.make;
        document.getElementsByName('customer.vehicle.model')[0].value = call.customer.vehicle.model;
        document.getElementsByName('customer.vehicle.year')[0].value = call.customer.vehicle.year;
        document.getElementsByName('customer.vehicle.color')[0].value = call.customer.vehicle.color;
        document.getElementsByName('customer.vehicle.licensePlateNumber')[0].value = call.customer.vehicle.licensePlateNumber;
        document.getElementById('delete_call_submit').style.display = "";
        let create_call_submit = document.getElementById('create_call_submit');
        create_call_submit.innerHTML = "<i class='fa fa-check' aria-hidden='true'>&nbsp;</i>Update";
        create_call_submit.onclick = editCall;

        create_call_modal.style.display = "block";
    });

}


function serialize(form) {
    var json = {};
    if (typeof form == 'object' && form.nodeName == "FORM") {
        var len = form.elements.length;
        for (i = 0; i < len; i++) {
            field = form.elements[i];
            if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
                if (field.type == 'select-multiple') {
                    for (j = form.elements[i].options.length - 1; j >= 0; j--) {
                        if (field.options[j].selected)
                            s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[j].value);
                    }
                } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
                    var parsedName = field.name.split(".");
                    parsedName.reduce((obj, i, index) => {
                        if (index < parsedName.length - 1) {
                            if (!obj[i]) {
                                obj[i] = {};
                            }
                        } else {
                            obj[i] = field.value;
                        }
                        return obj[i]
                    }, json);
                }
            }
        }
    }
    return json;
}

function createCall() {
    let json = serialize(document.getElementById('create_call_form'));
    let originalDomForm = document.getElementById('create_call_form')[0];
    if (originalDomForm.checkValidity()) {
        makeRequest("POST", '/calls/create', JSON.stringify(json)).then(() => {
            refreshData();
            closeModal('create_call_modal');
        });
    }
}

function editCall() {
    let json = serialize(document.getElementById('create_call_form'));
    let originalDomForm = document.getElementById('create_call_form')[0];
    if (originalDomForm.checkValidity()) {
        makeRequest("POST", '/calls/edit', JSON.stringify(json)).then(() => {
            refreshData();
            closeModal('create_call_modal');
        });
    }
}

function deleteCall() {
    let json = serialize(document.getElementById('create_call_form'));
    let call_id = document.getElementById("call_id_input").value;
    let originalDomForm = document.getElementById('create_call_form')[0];
    if (originalDomForm.checkValidity()) {
        makeRequest("POST", '/calls/delete/' + call_id).then(() => {
            refreshData();
            closeModal('create_call_modal');
        });
    }
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

function makeRequest(method, url, data) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        url = domain + url;
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");
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
        xhr.send(data);
    });
}
let interval;

function createRefreshTimer(duration) {
    if(interval){
        clearInterval(interval);
    }
    let timer = duration;
    let minutes;
    let seconds;
    interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("refresh_time").textContent = minutes + "m" + seconds + "s";

        if (--timer < 0) {
           refreshData();
        }
    }, 1000);
}

let stateMap;

let initializePage = () => {
    // stateMap = initStateMap();
    buildTruckTable();
    buildCallsTable();
    createRefreshTimer(300);
}

let refreshData = () => {
    buildTruckTable();
    buildCallsTable();
    createRefreshTimer(300);
}

initializePage();