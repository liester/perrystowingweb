
var domain = 'https://perrystowingserver.herokuapp.com';
if (location.hostname == 'localhost' || location.hostname == '127.0.0.1') {
    domain = "http://localhost:8080"
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

function initStateMap() {
    var stateMap = L.map('stateMap', {
        center: [41.587972289460076, -93.6332130432129],
        zoom: 12,
        minZoom: 8,
        maxZoom: 18
    });
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(stateMap);

    return stateMap;
}

function createTruckMarker(truckNumber, status, updateTime, location) {
    var icon;
    if (status.toUpperCase() == 'AVAILABLE')
        icon = greenIcon;
    else if (status.toUpperCase() == 'EN-ROUTE')
        icon = redIcon;
    else if (status.toUpperCase() == 'LOADED')
        icon = blueIcon;
    else
        icon = greyIcon;
    var marker = L.marker(location, {
        icon: icon,
        keyboard: false,
        title: status
    }).bindPopup('Truck: ' + truckNumber + '<br>Status: ' + status + '<br>Update Time: ' + updateTime);
    return marker;
}

function getTrucksAddToMap(map) {
    // NOTE: The first thing we do here is clear the markers from the layer.
    markersLayer.clearLayers();
    makeRequest('GET', "/trucks").then((response) => {
        let trucks = JSON.parse(response);
        let validGpsTrucks = trucks.filter(function (truck) {
            return truck.gisLatitude && truck.gisLongitude;
        });
        validGpsTrucks.forEach(function (truck) {
            console.log('id:' + truck.id + '|gisLat:' + truck.gisLatitude + '|gisLon:' + truck.gisLongitude);
            let callTime = moment.unix(truck.updateTime)
            let marker = createTruckMarker(truck.identifier, truck.truckStatusType, callTime.format('MMM Do h:mm:ss a'), [truck.gisLatitude, truck.gisLongitude]);
            markersLayer.addLayer(marker);
            markers.push(marker);
        });
        markersLayer.addTo(map);
    });
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

let stateMap;
let markers = [];
let markersLayer = new L.LayerGroup(); // NOTE: Layer is created here!;

let initializePage = () => {
    stateMap = initStateMap();
    getTrucksAddToMap(stateMap);
    createRefreshTimer(300);
}

let refreshData = () => {
    getTrucksAddToMap(stateMap);
    createRefreshTimer(300);
}

initializePage();