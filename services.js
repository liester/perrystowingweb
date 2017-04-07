window.onclick = function (event) {
    let assign_truck_modal = document.getElementById('assign_truck_modal');
    let assign_call_modal = document.getElementById('assign_call_modal');
    let create_call_modal = document.getElementById('create_call_modal');
    let create_truck_modal = document.getElementById('create_truck_modal');
    let update_client_ids_modal = document.getElementById('update_client_ids_modal');
    let update_local_client_id_modal = document.getElementById('update_local_client_id_modal');
    if (event.target == assign_truck_modal) {
        assign_truck_modal.style.display = "none";
    } else if (event.target == assign_call_modal) {
        assign_call_modal.style.display = "none";
    } else if (event.target == create_call_modal) {
        create_call_modal.style.display = "none";
    } else if (event.target == create_truck_modal) {
        create_truck_modal.style.display = "none";
    } else if (event.target == update_client_ids_modal) {
        update_client_ids_modal.style.display = "none";
    } else if (event.target == update_local_client_id_modal) {
        update_local_client_id_modal.style.display = "none";
    }
}

function checkForClientId() {
    let localClientIdBtn = document.getElementById('local_client_id_btn');
    if (!getCookie('clientId')) {
        localClientIdBtn.classList.remove('btn-success');
        localClientIdBtn.classList.add('btn-danger');
    } else {
        localClientIdBtn.classList.remove('btn-danger');
        localClientIdBtn.classList.add('btn-success');
    }
};

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function deleteCookie(cname) {
    document.cookie = cname + "= ;";
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function updateWindowClientId(inputElement) {
    console.log(inputElement);
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

            let editIcon = document.createElement('i');
            editIcon.classList.add('fa');
            editIcon.classList.add('fa-pencil-square-o');
            editIcon.style.cssFloat = 'right';
            editIcon.style.marginRight = '2em';

            let span = document.createElement('span');
            span.addEventListener('click', () => {
                openEditTruckModal(truck['id']);
            });
            span.style.cursor = "pointer";
            span.appendChild(editIcon);

            tdElement.appendChild(span);
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


function openUpdateLocalClientIdModal(truckId) {
    let update_local_client_id_modal = document.getElementById('update_local_client_id_modal');
    update_local_client_id_modal.style.display = "block";

    document.getElementById('local_client_id').value = getCookie("clientId");

}

function updateLocalClientId() {
    let local_client_id = document.getElementById('local_client_id').value;
    setCookie('clientId', local_client_id);
    closeModal('update_local_client_id_modal');
    checkForClientId();
}


function openUpdateClientIdModal() {
    makeRequest('GET', '/clients').then((clients) => {
        clients = JSON.parse(clients);
        let client_id_list = document.getElementById("client_id_list");
        removeChildNodes(client_id_list);
        let update_client_ids_modal = document.getElementById('update_client_ids_modal');
        update_client_ids_modal.style.display = "block";

        // build headers
        let headers = document.createElement('div');
        headers.classList.add('row')
        let headerColumn1 = document.createElement('div');
        headerColumn1.classList.add('col-sm-1');
        headerColumn1.innerText = "ID";

        let headerColumn2 = document.createElement('div');
        headerColumn2.classList.add('col-sm-5');
        headerColumn2.innerText = "Client ID";

        let headerColumn3 = document.createElement('div');
        headerColumn3.classList.add('col-sm-2');
        headerColumn3.innerText = "Role";
        let headerColumn4 = document.createElement('div');
        headerColumn4.classList.add('col-sm-2');
        headerColumn4.innerText = "Action";
        headers.appendChild(headerColumn1);
        headers.appendChild(headerColumn2);
        headers.appendChild(headerColumn3);
        headers.appendChild(headerColumn4);
        client_id_list.appendChild(headers);


        clients.forEach((client) => {
            let row = document.createElement('div');
            row.classList.add('row');
            row.classList.add('client_id_row');
            row.id = 'delete_client_id_' + client.id;
            let col1 = document.createElement('div');
            col1.classList.add('col-sm-1');
            col1.innerText = client.id;
            let col2Input = document.createElement('input');
            col2Input.classList.add('col-sm-5');
            col2Input.maxLength = 16;
            col2Input.value = client.clientId;
            let col3Input = document.createElement('input');
            col3Input.classList.add('col-sm-2');
            col3Input.maxLength = 2;
            col3Input.value = client.role;
            let col4Delete = document.createElement('button');
            col4Delete.classList.add('col-sm-2');
            col4Delete.classList.add('btn-danger');
            col4Delete.classList.add('btn');
            col4Delete.type = 'button';
            col4Delete.innerText = 'Delete';
            col4Delete.value = client.id;
            col4Delete.onclick = deleteClientId;
            row.appendChild(col1);
            row.appendChild(col2Input);
            row.appendChild(col3Input);
            row.appendChild(col4Delete);
            client_id_list.appendChild(row);
        });
    });
}

function deleteClientId(element) {
    let clientId = element.currentTarget.value;
    makeRequest("GET", "/clients/delete/" + clientId).then(() => {
        let client_id_to_delete = document.getElementById('delete_client_id_' + clientId);
        if (client_id_to_delete.parentNode) {
            client_id_to_delete.parentNode.removeChild(client_id_to_delete);
        }
    });
}

function createNewClientId() {
    let client_id_list = document.getElementById("client_id_list");
    let row = document.createElement('div');
    row.classList.add('row');
    row.classList.add('client_id_row');
    row.id = 'delete_client_id_' + 0;
    let col1 = document.createElement('div');
    col1.classList.add('col-sm-1');
    col1.innerText = "";
    let col2Input = document.createElement('input');
    col2Input.classList.add('col-sm-5');
    col2Input.maxLength = 16;
    col2Input.value = "";
    let col3Input = document.createElement('input');
    col3Input.classList.add('col-sm-2');
    col3Input.maxLength = 2;
    col3Input.value = "";
    let col4Delete = document.createElement('button');
    col4Delete.classList.add('col-sm-2');
    col4Delete.classList.add('btn-danger');
    col4Delete.classList.add('btn');
    col4Delete.type = 'button';
    col4Delete.innerText = 'Delete';
    col4Delete.value = 0;
    col4Delete.onclick = deleteClientId;
    row.appendChild(col1);
    row.appendChild(col2Input);
    row.appendChild(col3Input);
    row.appendChild(col4Delete);
    client_id_list.appendChild(row);
}

function updateClientIds() {
    let clientIdRows = document.querySelectorAll('.client_id_row');
    let clientIdList = [];
    clientIdRows.forEach((clientIdRow) => {
        let clientId = {};
        clientId.clientId = clientIdRow.childNodes[1].value
        clientId.role = clientIdRow.childNodes[2].value
        clientIdList.push(clientId);
    });
    let truckId = document.getElementById('assign_call_submit').dataset.truckid;
    let assign_call_modal = document.getElementById('assign_call_modal');
    makeRequest('POST', "/clients/update", JSON.stringify(clientIdList)).then((call) => {
        refreshData();
        closeModal('update_client_ids_modal');
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
    document.getElementsByName('comment')[0].value = "";
    document.getElementsByName('customer.vehicle.keyLocationType')[0].value = 1;
    document.getElementsByName('towTruckType')[0].value = 1;
    document.getElementsByName('customer.paymentType')[0].value = 1;
    document.getElementsByName('callType')[0].value = 1;

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
        document.getElementsByName('customer.priceQuote')[0].value = call.customer.priceQuote.trim();
        document.getElementsByName('pickUpLocation')[0].value = call.pickUpLocation;
        document.getElementsByName('dropOffLocation')[0].value = call.dropOffLocation;
        document.getElementsByName('customer.vehicle.make')[0].value = call.customer.vehicle.make;
        document.getElementsByName('customer.vehicle.model')[0].value = call.customer.vehicle.model;
        document.getElementsByName('customer.vehicle.year')[0].value = call.customer.vehicle.year;
        document.getElementsByName('customer.vehicle.color')[0].value = call.customer.vehicle.color;
        document.getElementsByName('customer.vehicle.licensePlateNumber')[0].value = call.customer.vehicle.licensePlateNumber;
        document.getElementsByName('comment')[0].value = call.comment.trim();
        if (call.towTruckType) {
            document.getElementsByName('towTruckType')[0].value = call.towTruckType.id;
        } else {
            document.getElementsByName('towTruckType')[0].value = 0;
        }

        if (call.customer.vehicle.keyLocationType) {
            document.getElementsByName('customer.vehicle.keyLocationType')[0].value = call.customer.vehicle.keyLocationType.id;
        } else {
            document.getElementsByName('customer.vehicle.keyLocationType')[0].value = 0;
        }

        if (call.customer.paymentType) {
            document.getElementsByName('customer.paymentType')[0].value = call.customer.paymentType.id;
        } else {
            document.getElementsByName('customer.paymentType')[0].value = 0;
        }

        if (call.callType) {
            document.getElementsByName('callType')[0].value = call.callType.id;
        } else {
            document.getElementsByName('callType')[0].value = 0;
        }
        document.getElementById('delete_call_submit').style.display = "";
        let create_call_submit = document.getElementById('create_call_submit');
        create_call_submit.innerHTML = "<i class='fa fa-check' aria-hidden='true'>&nbsp;</i>Update";
        create_call_submit.onclick = editCall;

        create_call_modal.style.display = "block";
    });

}


function openCreateTruckModal() {
    // console.log('create truck');
    let create_truck_modal = document.getElementById('create_truck_modal');
    document.getElementById("truck_id_input").value = "";
    document.getElementsByName('identifier')[0].value = "";
    document.getElementsByName('driverLastName')[0].value = "";
    document.getElementsByName('driverFirstName')[0].value = "";
    document.getElementById('delete_truck_submit').style.display = "none";
    let create_truck_submit = document.getElementById('create_truck_submit');
    create_truck_submit.innerHTML = "<i class='fa fa-check' aria-hidden='true'>&nbsp;</i>Create";
    create_truck_submit.onclick = createTruck;
    create_truck_modal.style.display = "block";

}
function openEditTruckModal(truckId) {
    makeRequest('GET', '/trucks/' + truckId).then((truckString) => {
        let truck = JSON.parse(truckString);
        let create_truck_modal = document.getElementById('create_truck_modal');
        document.getElementById("truck_id_input").value = truck.id;
        document.getElementsByName('identifier')[0].value = truck.identifier;
        document.getElementsByName('driverFirstName')[0].value = truck.driverFirstName;
        document.getElementsByName('driverLastName')[0].value = truck.driverLastName;
        document.getElementById('delete_truck_submit').style.display = "";
        let create_truck_submit = document.getElementById('create_truck_submit');
        create_truck_submit.innerHTML = "<i class='fa fa-check' aria-hidden='true'>&nbsp;</i>Update";
        create_truck_submit.onclick = editTruck;

        create_truck_modal.style.display = "block";
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

function createTruck() {
    let json = serialize(document.getElementById('create_truck_form'));
    let originalDomForm = document.getElementById('create_truck_form')[0];
    if (originalDomForm.checkValidity()) {
        makeRequest("POST", '/trucks/create', JSON.stringify(json)).then(() => {
            refreshData();
            closeModal('create_truck_modal');
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

function editTruck() {
    let json = serialize(document.getElementById('create_truck_form'));
    let originalDomForm = document.getElementById('create_truck_form')[0];
    if (originalDomForm.checkValidity()) {
        makeRequest("POST", '/trucks/edit', JSON.stringify(json)).then(() => {
            refreshData();
            closeModal('create_truck_modal');
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

function deleteTruck() {
    let json = serialize(document.getElementById('create_truck_modal'));
    let truck_id = document.getElementById("truck_id_input").value;
    let originalDomForm = document.getElementById('create_truck_form')[0];
    if (originalDomForm.checkValidity()) {
        makeRequest("POST", '/trucks/delete/' + truck_id).then(() => {
            refreshData();
            closeModal('create_truck_modal');
        });
    }
}

function makeRequest(method, url, data) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        url = domain + url;
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.withCredentials = true;
        xhr.setRequestHeader('Client-Id', getCookie('clientId'))
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
    if (interval) {
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


let initializePage = () => {
    buildTruckTable();
    buildCallsTable();
    createRefreshTimer(300);
    checkForClientId();
}

let refreshData = () => {
    buildTruckTable();
    buildCallsTable();
    createRefreshTimer(300);
    checkForClientId();
}

initializePage();