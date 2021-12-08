function createElementFromHTML(html) {
  var div = document.createElement('div');
  div.innerHTML = html.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

function createDropdown(port, name, list, presetChoice) {
    var d = document;
    var drop = d.createElement("div");
    drop.classList.add("dropdown");
    var input = createElementFromHTML("<span class=\"field\"></span>");
    input.appendChild(createElementFromHTML("<p class=\"cfg\" id=\"modbus-" + port + "-" + name + "\">"+presetChoice+"</p>"));
    var span = d.createElement("span");
    span.innerHTML = "▼";
    span.classList.add("da");
    input.appendChild(span);
    drop.appendChild(input);
    var ul = d.createElement("ul");
    for(var i = 0; i < list.length; i++) {
        ul.appendChild(createElementFromHTML("<li class=\"dropdown_item\" id=\"modbus-" + port + "-" + name + "-item-" + list[i] + "\">" + list[i] + "</li>"));
    }
    drop.appendChild(ul);
    var tcell = d.createElement("td");
    tcell.appendChild(drop);
    return tcell;
}

function createCanDropdown(port, name, list, presetChoice) {
    var d = document;
    var drop = d.createElement("div");
    drop.classList.add("dropdown");
    var input = createElementFromHTML("<span class=\"field\"></span>");
    input.appendChild(createElementFromHTML("<p class=\"cfg\" id=\"can-" + port + "-" + name + "\">"+presetChoice+"</p>"));
    var span = d.createElement("span");
    span.innerHTML = "▼";
    span.classList.add("da");
    input.appendChild(span);
    drop.appendChild(input);
    var ul = d.createElement("ul");
    for(var i = 0; i < list.length; i++) {
        ul.appendChild(createElementFromHTML("<li>" + list[i] + "</li>"));
    }
    drop.appendChild(ul);
    var tcell = d.createElement("td");
    tcell.appendChild(drop);
    return tcell;
}
//Creates the fields for a modbus sensor type row
//Parameters: doc: document object that contains the table
//trow: table row object
//num: sensor number in field
//type: profile type "tcp_profile", "rtu_profile", etc
//ip_val: what to populate the ip address field with
//port_val: what to populate the port field with
function createModbusTypeFields(doc, trow, num, type, ip_val, port_val) {
    var td5 = doc.createElement("td");
    var td6 = doc.createElement("td");
    if (type == "tcp_profile")
    {
        td5.appendChild(createElementFromHTML("<input type='text' class='cfg-modbus-hideable' id='modbus-sensors-" + num + "-ip_addr' value='" + ip_val + "' size='10' required=''>"));
        td6.appendChild(createElementFromHTML("<input type='number' class='cfg-modbus-hideable' id='modbus-sensors-"+ num +"-port' value='" + port_val + "' onchange='assertPositive(this, 1, 65535)' min='1' max='65535' size='3' required=''>"));
        app.modbus_tcp_profiles[num] = 1;
    }
    else
    {
        td5.appendChild(createElementFromHTML("<input type='text' class='hidden' id='modbus-sensors-" + num + "-ip_addr' value='" + ip_val + "' size='10' required=''>"));
        td6.appendChild(createElementFromHTML("<input type='number' class='hidden' id='modbus-sensors-" + num + "-port' value='" + port_val + "' onchange='assertPositive(this, 1, 65535)' min='1' max='65535' size='3' required=''>"));
        app.modbus_tcp_profiles[num] = 0;
    }
    trow.appendChild(td5);
    trow.appendChild(td6);
}

//create the callbacks that hide/show the modbus type fields when the tcp option is selected
//num: row number to create callbacks for
function createModbusTypeDropdownCallbacks(num) {
    $("#modbus-sensors-" + num + "-type-item-rtu_profile").click(function() {
        var row = $(this).closest("tr");
        row.find(".cfg-modbus-hideable").addClass("hidden");
        row.find(".cfg-modbus-hideable").removeClass("cfg-modbus-hideable");
        app.modbus_tcp_profiles[num] = 0;
        if (!app.modbus_tcp_profiles.includes(1))
        {
            $(".modbus_col_hideable").hide();
        }
        console.log("rtu");
    });
    $("#modbus-sensors-" + num + "-type-item-tcp_profile").click(function() {
        var row = $(this).closest("tr");
        row.find(".hidden").addClass("cfg-modbus-hideable");
        row.find(".hidden").removeClass("hidden");
        app.modbus_tcp_profiles[num] = 1;
        $(".modbus_col_hideable").show();
        console.log("tcp");
    });
}

function deleteModbusTypeDropdownCallbacks(num) {
    $("modbus-sensors-" + num + "-type-item-rtu_profile").prop("onclick", null).off("click");
    $("modbus-sensors-" + num + "-type-item-tcp_profile").prop("onclick", null).off("click");
}

function buildTable(data, msg, dataElem, noDataElem, selector) {
    for(var i = 0; i < msg.length; i+=2) {
        data.push([msg[i + 1], msg[i]]);
    }
    data.sort(function(a, b) {
        // return a[1].length - b[1].length || a[1].localeCompare(b[1]);
        return Date.parse(b[0]) - Date.parse(a[0]);
    });
    var o = "<table style='max-width: 800px'>";
    for(var i = 0; i < data.length; i++) {
        var date = Date.parse(data[i][0]);
        o += "<tr><td class='trash " + selector + "'><button id='" + data[i][1] + "'><img title='Delete this' src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA2djE4aDE4di0xOGgtMTh6bTUgMTRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTF2LTEwYzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMXYxMHptNSAwYzAgLjU1Mi0uNDQ4IDEtMSAxcy0xLS40NDgtMS0xdi0xMGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDF2MTB6bTUgMGMwIC41NTItLjQ0OCAxLTEgMXMtMS0uNDQ4LTEtMXYtMTBjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxdjEwem00LTE4djJoLTIwdi0yaDUuNzExYy45IDAgMS42MzEtMS4wOTkgMS42MzEtMmg1LjMxNWMwIC45MDEuNzMgMiAxLjYzMSAyaDUuNzEyeiIvPjwvc3ZnPg=='></button></td><th>" + data[i][0] + "</th><td><a class='" + selector + "' id='" + data[i][1] + "'>" + data[i][1] + "</a></td></tr>";
    }
    o += "</table>";

    if(msg.length == 0) {
        document.getElementById(noDataElem).innerHTML = "No Data found.";
        document.getElementById(dataElem).innerHTML = "";
    } else {
        document.getElementById(noDataElem).innerHTML = "";
        document.getElementById(dataElem).innerHTML = o;
    }
}

function onGetFile(app, id, loc) {
    console.log(window.location.toString() + " --- " + id.toString() + " --- " + loc);
    if(loc == "log")
    {
        var new_location = window.location + id;
    }
    else if(loc == "rw")
    {
        var new_location = window.location + "datarw/" + id;
    }
    else if(loc == "tmp")
    {
        var new_location = window.location + "datatmp/" + id;
    }
    window.open(new_location);
    return;
}

function shake(elem) {
    $(elem).css('margin-right', '0');
    var margin = 5;
    var i = 0;
    var repeat = setInterval(function() {
        $(elem).css('margin-left', i % (margin * 2) + 'px');
        i++;
        if (i > margin * 5) clearInterval(repeat);
    }, 10);
}

function deleteLog(log, elem) {
    var file = null;
    if(log.includes("-log-")
        || log.includes("current")
        || log.includes("next")) {
        file = "/ps/rw/logs/" + log;
    } else {
        file = "/tmp/" + log;
    }
    sendCmd(app, app.CMD.CMD_DELETE_FILE, [file], function() {
        //console.log("deleted " + log);
        $(elem).parent().parent().fadeOut();
    }, function() {
        console.log("failed to delete " + log);
        shake(elem);
    });
}

function jq(myid) {
    return "#" + myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
}

//delete all log bundles and fade out their entries
function deleteAllLogs(path, elementList, modalWin) {
    sendCmd(app, app.CMD.CMD_DELETE_ALL_DIR, [path], function() {
        console.log("deleted successfully!");
        modalWin.parent().parent().hide();
        var entryList = elementList[0].children[0].children[0].children;
        for (var i = 0; i < entryList.length; i++) {
            var entry = entryList[i].children[0].children[0].id;
            if (entry.includes("-log-") || entry.includes("current") || entry.includes("next")) {
                $(jq(entry)).parent().parent().fadeOut();
            }
        }
    }, function() {
        console.log("delete failed");
    })
}

function deleteData(data, elem) {
    var file = null;
    var id = $(elem).closest('ul').attr('id');
    if(id == 'data-persistent') {
        file = "/ps/rw/data/" + data;
    } else {
        file = "/tmp/data/" + data;
    }
    console.log("delete " + data)
    sendCmd(app, app.CMD.CMD_DELETE_FILE, [file], function() {
        //console.log("deleted " + data);
        $(elem).parent().parent().fadeOut();
    }, function() {
        console.log("failed to delete " + data);
        shake(elem);
    });
}

function downloadAllInDir(path) {
    sendCmd(app, app.CMD.CMD_DOWNLOAD_ALL, [path], function(msg) {
        console.log('ok!');
        // redirect to created zip file (bundle is a symlink to /ps/rw/webui)
        window.location = window.location + "/bundle/" + msg + ".tar.gz";
    }, function() {
        console.log('download all failed');
    });
}

//delete all files in a folder and fade out the list of files
function deleteAllInDir(path, elementList, modalWin) {
    sendCmd(app, app.CMD.CMD_DELETE_ALL_DIR, [path], function() {
        console.log("deleted successfully!");
        if (elementList != null) {
            elementList.fadeOut();
        }
        modalWin.parent().parent().hide();
    }, function() {
        console.log("delete failed");
    });
}

//dialog window that asks the user if they really want to delete whatever
//file. if they click yes, run the callback function
function deleteDialog(callback, path, elem, loc) {
    $(".modal").hide();
    $(".modal-window").show();
    $(".modal#delete-file").show();
    window.scrollTo(0, 0); //modal only shows up at the top of the screen so you have to scroll to see it
    document.getElementById("confirm-delete-file").onclick = function() {
        callback(path, elem, loc);
        $(".modal#delete-file").parent().parent().hide();
    };
}

function assertPositive(input, min, max) {
    if(isNaN(parseInt(input.value))){
        input.value = min;
    }
    else if(input.value < min)
    {
        input.value = min;
    }
    else if(max !== null)
    {
        if(input.value > max)
        {
            input.value = max;
        }
    }
}

function deleteSensor(c, name){

    //delete from HTML
    var table=document.getElementById("sensors");
    var index=getElementIndex(name);
    console.log("Unparsed index: "+index);
    index=parseInt(index);
    //var tree=table.childNodes[index];
    //console.log(tree.id);
    //table.removeChild(tree);
    var tree=document.getElementById("mb_sensor_tree_"+index);
    console.log("Tree id: "+tree.id);
    table.removeChild(tree);

    //Delete from JSON
    path=c['modbus']['sensors'];
    path.splice(index,1);

    // //shift indeces
    for(var k=index+1;k<=path.length;k++){
        var temp="mb_sensor_tree_"+k;
        console.log(temp);
        var tree= document.getElementById(temp);
        tree.id="mb_sensor_tree_"+(k-1);

        var trash=document.getElementById("sensorTrash"+k);
        trash.id="sensorTrash"+(k-1);

        var name=document.getElementById("modbus-sensors-"+k+"-name");
        name.id="modbus-sensors-"+(k-1)+"-name";

        var slave=document.getElementById("modbus-sensors-"+k+"-slave");
        slave.id="modbus-sensors-"+(k-1)+"-slave";

        var delay=document.getElementById("modbus-sensors-"+k+"-delay");
        delay.id="modbus-sensors-"+(k-1)+"-delay";

        var rate= document.getElementById("modbus-sensors-"+k+"-rate");
        rate.id="modbus-sensors-"+(k-1)+"-rate";

        var type=document.getElementById("modbus-sensors-"+k+"-type");
        type.id="modbus-sensors-"+(k-1)+"-type";

        var profile=document.getElementById("modbus-sensors-"+k+"-profile");
        profile.id="modbus-sensors-"+(k-1)+"-profile";

        //make sure callbacks for dropdown menu clicks still work
        deleteModbusTypeDropdownCallbacks(k);
        $(".dropdown_item").filter("[id^='modbus-sensors-" + k + "']").each(function() {
            var id = $(this).attr('id');
            var k_str = '' + k;
            var k_len = k_str.length;
            $(this).attr('id', id.substring(0, id.indexOf(k)) + (k - 1) + id.substring(id.indexOf(k) + k_len));
        });
        createModbusTypeDropdownCallbacks(k - 1);

        var ip_addr = document.getElementById("modbus-sensors-" + k + "-ip_addr");
        ip_addr.id = "modbus-sensors-" + (k - 1) + "-ip_addr";

        var port = document.getElementById("modbus-sensors-" + k + "-port");
        port.id = "modbus-sensors-" + (k - 1) + "-port";

        app.modbus_tcp_profiles[k - 1] = app.modbus_tcp_profiles[k];
    }
    if (!app.modbus_tcp_profiles.includes(1))
    {
        $(".modbus_col_hideable").hide();
    }

}

function deleteCanSensor(c, name){

    //delete from HTML
    var table=document.getElementById("can-sensors");
    //name format: can-trash-[num]
    var name_arr = name.split("-");
    var index=name_arr[2];
    console.log("Unparsed index: "+index);
    index=parseInt(index);
    //var tree=table.childNodes[index];
    //console.log(tree.id);
    //table.removeChild(tree);
    var tree=document.getElementById("can_sensor_tree_"+index);
    console.log("Tree id: "+tree.id);
    table.removeChild(tree);

    //Delete from JSON
    path=c['can']['sensors'];
    path.splice(index,1);

    // //shift indeces
    for(var k=index+1;k<=path.length;k++){
        var temp="can_sensor_tree_"+k;
        console.log(temp);
        var tree= document.getElementById(temp);
        tree.id="can_sensor_tree_"+(k-1);

        var trash=document.getElementById("can-trash-"+k);
        trash.id="can-trash-"+(k-1);

        var name=document.getElementById("can-sensors-"+k+"-name");
        name.id="can-sensors-"+(k-1)+"-name";

        var rate= document.getElementById("can-sensors-"+k+"-rate");
        rate.id="can-sensors-"+(k-1)+"-rate";

        var profile=document.getElementById("can-sensors-"+k+"-profile");
        profile.id="can-sensors-"+(k-1)+"-profile";
    }
}

function getElementIndex(id){
    return id.substring(11);
}

function addSensor(){
    $(".dropdown").click(function(ev) {
        ev.stopPropagation();
        var isHover = this.classList.contains("hover");
        $(".dropdown").removeClass("hover");
        if(!isHover) {
            $(this).addClass("hover");
        }
    });
    // todo remove
    $(".dropdown ul li").click(function(ev) {
        ev.stopPropagation();
        var dd = $(this).closest(".dropdown");
        dd.find("input").attr('value', ev.target.innerHTML);
        dd.find("p").text(ev.target.innerHTML);
        dd.removeClass("hover");
    });

    var path=app.cfg['modbus']['sensors'];
    var d=document;
    var num=path.length;
    var tr1= d.createElement("tr");
    tr1.id="mb_sensor_tree_"+num;
    var button=createElementFromHTML("<td class='trash sensors'><button id='sensorTrash"+num+"'><img title='Delete this' src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA2djE4aDE4di0xOGgtMTh6bTUgMTRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTF2LTEwYzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMXYxMHptNSAwYzAgLjU1Mi0uNDQ4IDEtMSAxcy0xLS40NDgtMS0xdi0xMGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDF2MTB6bTUgMGMwIC41NTItLjQ0OCAxLTEgMXMtMS0uNDQ4LTEtMXYtMTBjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxdjEwem00LTE4djJoLTIwdi0yaDUuNzExYy45IDAgMS42MzEtMS4wOTkgMS42MzEtMmg1LjMxNWMwIC45MDEuNzMgMiAxLjYzMSAyaDUuNzEyeiIvPjwvc3ZnPg=='></button></td>");

    tr1.appendChild(button);

    button.onclick=function(e){ deleteSensor(app.cfg,e.currentTarget.id); };

    var td1=d.createElement("td");
    td1.appendChild(createElementFromHTML("<input type='text' class='cfg' id='modbus-sensors-"+num+"-name' size='10' required=''>"));
    tr1.appendChild(td1);

    var td2=d.createElement("td");
    td2.appendChild(createElementFromHTML("<input type='number' class='cfg' id='modbus-sensors-"+num+"-slave' value='1' onchange='assertPositive(this, 1, 254)' min='1' max='254' size='3' required=''>"));

    var td3=d.createElement("td");
    td3.appendChild(createElementFromHTML("<input type='number' class='cfg' id='modbus-sensors-"+num+"-delay' value='0' onchange='assertPositive(this, 0, null)' min='0' required=''>"));

    var td4=d.createElement("td");
    td4.appendChild(createElementFromHTML("<input type='number' class='cfg' id='modbus-sensors-"+num+"-rate' value='0' onchange='assertPositive(this, 0, null)' min='0' required=''>"));

    tr1.appendChild(td2);
    tr1.appendChild(td3);
    tr1.appendChild(td4);
    tr1.appendChild(createDropdown("sensors", num+"-type", app.types, app.types[0]));
    tr1.appendChild(createDropdown("sensors", num+"-profile", app.profiles, app.profiles[0]));
    createModbusTypeFields(d, tr1, num, app.types[0], "192.168.5.2", 502);
    console.log(app);
    document.getElementById("sensors").appendChild(tr1);
    createModbusTypeDropdownCallbacks(num);



    path.push({"name": " ",
                "slave": 1,
                "delay": 0,
                "rate": 0,
                "type": "rtu_profile",
                "port": "RS485",
                "profile": "dm"});

    $(".dropdown").click(function(ev) {
        ev.stopPropagation();
        var isHover = this.classList.contains("hover");
        $(".dropdown").removeClass("hover");
        if(!isHover) {
            $(this).addClass("hover");
        }
    });
    // todo remove
    $(".dropdown ul li").click(function(ev) {
        ev.stopPropagation();
        var dd = $(this).closest(".dropdown");
        dd.find("input").attr('value', ev.target.innerHTML);
        dd.find("p").text(ev.target.innerHTML);
        dd.removeClass("hover");
    });
}

function addCanSensor(){
    $(".dropdown").click(function(ev) {
        ev.stopPropagation();
        var isHover = this.classList.contains("hover");
        $(".dropdown").removeClass("hover");
        if(!isHover) {
            $(this).addClass("hover");
        }
    });
    // todo remove
    $(".dropdown ul li").click(function(ev) {
        ev.stopPropagation();
        var dd = $(this).closest(".dropdown");
        dd.find("input").attr('value', ev.target.innerHTML);
        dd.find("p").text(ev.target.innerHTML);
        dd.removeClass("hover");
    });

    var path=app.cfg['can']['sensors'];
    var doc=document;
    var num=path.length;
    var row= doc.createElement("tr");
    row.id="can_sensor_tree_"+num;
    var button=createElementFromHTML("<td class='trash sensors'><button id='can-trash-"+num+"'><img title='Delete this' src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA2djE4aDE4di0xOGgtMTh6bTUgMTRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTF2LTEwYzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMXYxMHptNSAwYzAgLjU1Mi0uNDQ4IDEtMSAxcy0xLS40NDgtMS0xdi0xMGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDF2MTB6bTUgMGMwIC41NTItLjQ0OCAxLTEgMXMtMS0uNDQ4LTEtMXYtMTBjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxdjEwem00LTE4djJoLTIwdi0yaDUuNzExYy45IDAgMS42MzEtMS4wOTkgMS42MzEtMmg1LjMxNWMwIC45MDEuNzMgMiAxLjYzMSAyaDUuNzEyeiIvPjwvc3ZnPg=='></button></td>");

    row.appendChild(button);

    button.onclick=function(e){ deleteCanSensor(app.cfg,e.currentTarget.id); };

    var name_field = doc.createElement("td");
    name_field.appendChild(createElementFromHTML("<input type='text' class='cfg' id='can-sensors-"+num+"-name' size='10' required=''>"));

    var rate_field = doc.createElement("td");
    rate_field.appendChild(createElementFromHTML("<input type='number' class='cfg' id='can-sensors-"+num+"-rate' value='0' onchange='assertPositive(this, 0, null)' min='0' required=''>"));

    row.appendChild(name_field);
    row.appendChild(rate_field);
    row.appendChild(createCanDropdown("sensors", num+"-profile", app.can_profiles, app.can_profiles[0]));
    console.log(app);
    document.getElementById("can-sensors").appendChild(row);

    path.push({"name": " ",
                "rate": 0,
                "profile": app.can_profiles[0]});

    $(".dropdown").click(function(ev) {
        ev.stopPropagation();
        var isHover = this.classList.contains("hover");
        $(".dropdown").removeClass("hover");
        if(!isHover) {
            $(this).addClass("hover");
        }
    });
    // todo remove
    $(".dropdown ul li").click(function(ev) {
        ev.stopPropagation();
        var dd = $(this).closest(".dropdown");
        dd.find("input").attr('value', ev.target.innerHTML);
        dd.find("p").text(ev.target.innerHTML);
        dd.removeClass("hover");
    });
}



function attachFileHandlers(app, elem, onGet, onDelete, loc) {
    $('a.' + elem).click(function(e) {
        e.preventDefault();
        var id = $(this).attr('id');
        onGet(app, id, loc);
    });
    $('.trash.' + elem + ' button').click(function(e) {
        var file = $(this).attr('id');
        deleteDialog(onDelete, file, this);
    });
}

function attachLogHandlers(app) {
    attachFileHandlers(app, 'logFile', onGetFile, deleteLog, "log");
}

function attachDataHandlers(app, loc) {
    attachFileHandlers(app, 'dataTmpFile', onGetFile, deleteData, "tmp");
    attachFileHandlers(app, 'dataRwFile', onGetFile, deleteData, "rw");
}


function updateTz() {
    // convert timezones
    var oldZone = null;
    if(app.logsInit) {
        oldZone = app.timezone;
    } else {
        app.logsInit = true;
        // current time zone
        oldZone = parseInt(new Date().toString().split('GMT')[1].split(' ')[0]) / 100;
        var tz = oldZone < 0 ? oldZone : '+' + oldZone;
        $('.tz-selector .field p').text('Local time (UTC' + tz + ')');
    }
    app.timezone = 0;
    setFileDates(oldZone);
}

function validateSensorData(app){
    for(var k in app){
        console.log("iteration: "+k);
        //validate slave number 1-254
        var num=parseFloat(document.getElementById("modbus-sensors-"+k+"-slave").value);
        console.log(num);
        if(!(num<=254&& num>=1 && num%1==0)){
            console.log("Error at slave number");
            console.log(num);
            $("#sensor-error").text("invalid input: Slave number must be between 1-254");
            return false;
        }
        //validate delay number > 0
        console.log(num);
        num=parseFloat(document.getElementById("modbus-sensors-"+k+"-delay").value);
        if(num<0){
            console.log("Error at delay");
            console.log(num);
            $("#sensor-error").text("invalid input: Delay number must be positive");
            return false;
        }
        console.log(num);
        //validate rate number > 0
        num=parseFloat(document.getElementById("modbus-sensors-"+k+"-rate").value);
        if(num<0){
            console.log("Error at rate");
            console.log(num);
            $("#sensor-error").text("invalid input: Rate number must be positive");
            return false;
        }
    }
    $("sensor-error").value="";
    return true;
}

function bleTypeToString(type)
{
    switch(type)
    {
    case "0":
        return "iAlert v2";
    case "2":
        return "Dessicant Breather";
    case "9":
        return "M5600 BLE Pressure Transducer";
    default:
        return "Unknown";
    }
}
function bleTypeStringToType(typeString)
{
    switch(typeString)
    {
    case "iAlert v2":
        return "0";
    case "Dessicant Breather":
        return "2";
    case "M5600 BLE Pressure Transducer":
        return "9";
    default:
        return "-1"
    }
}

var trash_svg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA2djE4aDE4di0xOGgtMTh6bTUgMTRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTF2LTEwYzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMXYxMHptNSAwYzAgLjU1Mi0uNDQ4IDEtMSAxcy0xLS40NDgtMS0xdi0xMGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDF2MTB6bTUgMGMwIC41NTItLjQ0OCAxLTEgMXMtMS0uNDQ4LTEtMXYtMTBjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxdjEwem00LTE4djJoLTIwdi0yaDUuNzExYy45IDAgMS42MzEtMS4wOTkgMS42MzEtMmg1LjMxNWMwIC45MDEuNzMgMiAxLjYzMSAyaDUuNzEyeiIvPjwvc3ZnPg=="
var up_svg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTEyLjE3MSA1MTIuMTcxIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIuMTcxIDUxMi4xNzE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDc2LjcyMywyMTYuNjRMMjYzLjMwNSwzLjExNUMyNjEuMjk5LDEuMTA5LDI1OC41OSwwLDI1NS43NTMsMGMtMi44MzcsMC01LjU0NywxLjEzMS03LjU1MiwzLjEzNkwzNS40MjIsMjE2LjY0DQoJCQljLTMuMDUxLDMuMDUxLTMuOTQ3LDcuNjM3LTIuMzA0LDExLjYyN2MxLjY2NCwzLjk4OSw1LjU0Nyw2LjU3MSw5Ljg1Niw2LjU3MWgxMTcuMzMzdjI2Ni42NjdjMCw1Ljg4OCw0Ljc3OSwxMC42NjcsMTAuNjY3LDEwLjY2Nw0KCQkJaDE3MC42NjdjNS44ODgsMCwxMC42NjctNC43NzksMTAuNjY3LTEwLjY2N1YyMzQuODM3aDExNi44ODVjNC4zMDksMCw4LjE5Mi0yLjYwMyw5Ljg1Ni02LjU5Mg0KCQkJQzQ4MC43MTMsMjI0LjI1Niw0NzkuNzc0LDIxOS42OTEsNDc2LjcyMywyMTYuNjR6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=";
var down_svg = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTEyLjE3MSA1MTIuMTcxIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIuMTcxIDUxMi4xNzE7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDc5LjA0NiwyODMuOTI1Yy0xLjY2NC0zLjk4OS01LjU0Ny02LjU5Mi05Ljg1Ni02LjU5MkgzNTIuMzA1VjEwLjY2N0MzNTIuMzA1LDQuNzc5LDM0Ny41MjYsMCwzNDEuNjM4LDBIMTcwLjk3MQ0KCQkJYy01Ljg4OCwwLTEwLjY2Nyw0Ljc3OS0xMC42NjcsMTAuNjY3djI2Ni42NjdINDIuOTcxYy00LjMwOSwwLTguMTkyLDIuNjAzLTkuODU2LDYuNTcxYy0xLjY0MywzLjk4OS0wLjc0Nyw4LjU3NiwyLjMwNCwxMS42MjcNCgkJCWwyMTIuOCwyMTMuNTA0YzIuMDA1LDIuMDA1LDQuNzE1LDMuMTM2LDcuNTUyLDMuMTM2czUuNTQ3LTEuMTMxLDcuNTUyLTMuMTE1bDIxMy40MTktMjEzLjUwNA0KCQkJQzQ3OS43OTMsMjkyLjUwMSw0ODAuNzEsMjg3LjkxNSw0NzkuMDQ2LDI4My45MjV6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=";
function addBleDevice(addr)
{
    //if(addBleDevice.devices === undefined) addBleDevice.devices = [];
    if(this.values === undefined) this.values = [];
    // now type is added after the ble address.
    // Full example: 12:34:56:78:90:AB-9
    // we need to split the type out then carry on with the old address style
    var tmp = addr.split('-');
    if(tmp.length == 2)
    {
        addr = tmp[0];
        type = bleTypeToString(tmp[1]);
        // valid ble address: 12:34:56:78:90:AB (hex)
        // also don't add duplicates
        if(!addBleDevice.devices.includes(addr + "-" + tmp[1])
            && addr.length == 17 && addr.split(':').length == 6)
        {
            addBleDevice.devices.push(addr + "-" + tmp[1]);

            var tr1= document.createElement("tr");
            tr1.setAttribute("id", "ble_row_" + addBleDevice.devices.length);

            var td1 = document.createElement("td");
            td1.setAttribute("class", "ble_up_down");
            var trash = createElementFromHTML("<button type='button' id='ble_trash_"
                + addBleDevice.devices.length + "'><img title='Remove Ble Device' src='"
                + trash_svg + "'></img></button>");
            trash.onclick=function(e){
                deleteBleDevice(e.currentTarget.id);
            };
            td1.appendChild(trash);
            var up = createElementFromHTML("<button type='button' id='ble_up_"
                + addBleDevice.devices.length + "'><img title='Move Sensor Up' src='"
                + up_svg + "'></img></button>");
            up.onclick=function(e){
                mvBleDevice(e.currentTarget.id, "up");
            };
            td1.appendChild(up);
            var down = createElementFromHTML("<button type='button' id='ble_down_"
                + addBleDevice.devices.length + "'><img title='Move Sensor Down' src='"
                + down_svg + "'></img></button>");
            down.onclick=function(e){
                mvBleDevice(e.currentTarget.id, "down");
            };
            td1.appendChild(down);
            tr1.appendChild(td1);

            var td2 = document.createElement("td");
            td2.setAttribute("id", "ble_number_" + addBleDevice.devices.length);
            td2.appendChild(createElementFromHTML("<h5 class='display-inline'>" +
                addBleDevice.devices.length + ": " + type + " </h5>"));
            tr1.appendChild(td2);

            var td3=document.createElement("td");
            td3.appendChild(createElementFromHTML("<h5 class='display-inline' id='ble_" +
                addBleDevice.devices.length + "'>" + addr + "</h5>"));
            td3.appendChild(createElementFromHTML("<br>"));
            tr1.appendChild(td3);
            document.getElementById("ble-sensors").appendChild(tr1)
        }
    }
}
if(addBleDevice.devices === undefined) addBleDevice.devices = [];

function deleteBleDevice(id)
{
    var num = parseInt(id.split('_')[2]);
    if(num > 0 && num <= addBleDevice.devices.length)
    {
        // first chunk is from 0 to index of device we want (since its not inclusive)
        var head = addBleDevice.devices.slice(0, num-1);
        // second chunk is from index AFTER the one we want to the end
        var tail = addBleDevice.devices.slice(num, addBleDevice.devices.length);
        var new_devices = head.concat(tail);
        // start at 1 and go to equal to length since these are 1 index
        for (var i = 1; i <= addBleDevice.devices.length; i++)
        {
            var row = $("#ble_row_" + i);
            row.remove()
        }
        addBleDevice.devices = [];
        for (var i = 0; i < new_devices.length; i++)
        {
            addBleDevice(new_devices[i]);
        }
    }
}

function mvBleDevice(id, direction)
{
    var num_1 = parseInt(id.split('_')[2]);
    if(num_1 > 0 && num_1 <= addBleDevice.devices.length)
    {
        var num_2 = null;
        // since top of list is 1, up actually decreases number
        if(direction == "up" && num_1 != 1) num_2 = num_1-1;
        else if(direction == "down" && num_1 != addBleDevice.devices.length) num_2 = num_1+1;
        if(num_2 != null && num_2 <= addBleDevice.devices.length)
        {
            // move item in list (-1s are because number is 1 index, array is 0)
            var new_item_1 = addBleDevice.devices[num_2-1];
            var new_item_2 = addBleDevice.devices[num_1-1];
            addBleDevice.devices[num_1-1] = new_item_1;
            addBleDevice.devices[num_2-1] = new_item_2;
            var new_devices = addBleDevice.devices;
            // start at 1 and go to equal to length since these are 1 index
            for (var i = 1; i <= addBleDevice.devices.length; i++)
            {
                var row = $("#ble_row_" + i);
                row.remove()
            }
            addBleDevice.devices = [];
            for (var i = 0; i < new_devices.length; i++)
            {
                addBleDevice(new_devices[i]);
            }
        }
    }
}

function getBleDeviceCfg()
{
    var cfg_str = "";
    for(var i = 0; i < addBleDevice.devices.length; i++)
    {
        cfg_str += addBleDevice.devices[i] + ",";
    }
    return cfg_str;
}

// the order of these commands must match that of the ones in the C code
var commands = [
    {
        'key': 'CMD_GET_PERIODIC',
    },
    {
        'key': 'CMD_LOGIN',
        'trigger': 'btn-login',
        'getArgs': function() {
            var usr = $("#lgn-usr").val();
            var pwd = $("#lgn-pwd").val();
            var sa1 = sha256(usr + "ap2200v3" + pwd);
            var sa2 = sha256(sa1 + app.nonce);

            // store sa1 in memory for each request
            app.sa1 = sa1;

            return [sa2];
        },
        'funcOk': function(msg) {
            msg = JSON.parse(msg);
            $(".container#login").hide();
            $(".container#main-window").show();
            app.loggedIn = true;
            // read stats
            $('#dev-sn').text("15-" + msg.stats[0]);
            $('#hw-id').text(msg.stats[1]);
            $('#fw-vers').text(msg.stats[2]);

            //gets the possible sensor profiles
            var profiles=[];
            count=3;
            while(count!=msg.stats.length){
                profiles.push(msg.stats[count]);
                count++;
            }
        },
        'funcFail': function() {
            $("#lgn-error").text("invalid username or password");
        }
    },
    {
        'key': 'CMD_SET_CFG',
        'trigger': '.btn-apply-confirm',
        'getArgs': function() {
            // check password fields
            /*
            var passMatch = $("#pwd-ad").val() == $("#pwd-re").val();
            if(!passMatch) {
                $("#pass-match").show();
                return -1;
            }*/
                var c = 0;
                var path = 0;
                $('.cfg, .cfg-modbus-hideable').each(function(i, obj) {
                    c = app.cfg;
                    path = obj.id.split('-');
                    for(var i = 0; i < path.length - 1; i++) {
                        if(!isNaN(path[i])){
                            path[i]=parseInt(path[i]);
                        }
                        if(typeof(c[path[i]]) == "undefined") {
                            c[path[i]] = {};
                        }
                        c = c[path[i]];
                    }
                    switch(obj.type) {
                    case 'checkbox':
                        c[path[path.length - 1]] = obj.checked;
                        break;
                    default:
                        console.log('key:' + path[path.length - 1] + ' type: ' + obj.type + ' value: ' + getValue(obj))
                        if(path[path.length - 1] == "urat")
                        {
                            if(getValue(obj) == "7 - LTE CAT M1 Only")
                            {
                                c[path[path.length - 1]] = "7"
                            }
                            else if(getValue(obj) == "8 - LTE NB-IOT Only")
                            {
                                c[path[path.length - 1]] = "8"
                            }
                            else
                            {
                                c[path[path.length - 1]] = "7,8"
                            }
                        }
                        else if(path[path.length - 1] == "urat3g")
                        {
                            if(getValue(obj) == "0 - 2G Only")
                            {
                                c[path[path.length - 1]] = "0"
                            }
                            else if(getValue(obj) == "2 - 3G Only")
                            {
                                c[path[path.length - 1]] = "2"
                            }
                            else if(getValue(obj) == "1,0 - 2G/3G, 2G Preferred")
                            {
                                c[path[path.length - 1]] = "1,0"
                            }
                            else
                            {
                                c[path[path.length - 1]] = "1,2"
                            }
                        }
                        else if(path[path.length - 1] == "umnoprof")
                        {
                            if(getValue(obj) == "Other")
                            {
                                c[path[path.length - 1]] = 0
                            }
                            else if(getValue(obj) == "ATT")
                            {
                                c[path[path.length - 1]] = 2
                            }
                            else if(getValue(obj) == "Verizon")
                            {
                                c[path[path.length - 1]] = 3
                            }
                            else if(getValue(obj) == "Telestra")
                            {
                                c[path[path.length - 1]] = 4
                            }
                            else if(getValue(obj) == "T-Mobile USA")
                            {
                                c[path[path.length - 1]] = 5
                            }
                            else if(getValue(obj) == "China Telecom")
                            {
                                c[path[path.length - 1]] = 6
                            }
                            // This covers SIM Select as well, since thats a good fail-safe
                            else
                            {
                                c[path[path.length - 1]] = 1
                            }
                        }
                        else if(path[path.length - 1] == "interface")
                        {
                            if(getValue(obj) == "WiFi")
                            {
                                c[path[path.length - 1]] = "wlan0"
                            }
                            else if(getValue(obj) == "Ethernet")
                            {
                                c[path[path.length - 1]] = "eth0"
                            }
                            else if(getValue(obj) == "Modem")
                            {
                                c[path[path.length - 1]] = "ppp0"
                            }
                            else
                            {
                                c[path[path.length - 1]] = "External"
                            }
                        }
                        else
                        {
                            if(isNaN(getValue(obj)) || getValue(obj) === '') {
                                c[path[path.length - 1]] = getValue(obj);
                            } else {
                                if(getValue(obj) % 1 === 0) {
                                    c[path[path.length - 1]] = parseInt(getValue(obj));
                                } else {
                                    c[path[path.length - 1]] = parseFloat(getValue(obj));
                                }
                            }
                        }
                    }
                });

                app.cfg.modbus.servers.internal.ble.devices = getBleDeviceCfg();
                console.log(JSON.stringify(app.cfg));
                return [JSON.stringify(app.cfg)];
            //}
        },
        'funcOk': function() {
            console.log('config updated');
            window.location = "/update.html";
        },
        'funcFail': function() {
            console.log('could not update config');
        }
    },
    {
        'key': 'CMD_REBOOT',
        'trigger': 'cmd-reboot',
        'getArgs': function() {
            $(".modal#reboot .hidden").addClass("show");
            $(".modal#reboot :not(.hidden)").addClass("hidden");
            $(".modal#reboot .show").removeClass("hidden");
            $('#status-off').show();
            $('#status-on').hide();
            return [];
        },
        'funcOk': function() {
            console.log('rebooting...');
            window.location = "/update.html?text=Please wait for the AP2200 to reboot.";
        },
        'funcFail': function() {
            console.log('could not reboot device');
        }
    },
    {
        'key': 'CMD_FACTORYRESET',
        'trigger': 'cmd-factoryreset',
        'getArgs': function() {
            $(".modal#factoryreset .hidden").addClass("show");
            $(".modal#factoryreset :not(.hidden)").addClass("hidden");
            $(".modal#factoryreset .show").removeClass("hidden");
            $('#status-off').show();
            $('#status-on').hide();
            return [];
        },
        'funcOk': function() {
            console.log('factory reseting...');
            window.location = "/update.html?time=130&text=Please wait for the AP2200 to be restored to its factory settings.";
        },
        'funcFail': function() {
            console.log('could not factory reset device');
        }
    },
    {
        'key': 'CMD_PING',
        'trigger': 'cmd-ping',
        'getArgs': function() {
            var addr = $('#ping-addr').val();
            return [addr];
        },
        'funcOk': function(msg) {
            var addr = $('#ping-addr').val();
            $(".response #ping").css({'color':'green'});
            $(".response #ping").text(addr + " is alive!");
            $(".response #ping").css({'opacity':0}).animate({'opacity':1});
        },
        'funcFail': function() {
            var addr = $('#ping-addr').val();
            $(".response #ping").css({'color':'red'});
            $(".response #ping").text(addr + " is not alive.");
            $(".response #ping").css({'opacity':0}).animate({'opacity':1});
        }
    },
    {
        'key': 'CMD_POWERCYCLE',
        'trigger': 'cmd-power-cycle',
        'getArgs': function() {
            // show modal
            $('.modal#power-cycle h3').text('Cycling sensors...');
            $('.modal#power-cycle button').hide();
            $('.modal#power-cycle').show();
            return [];
        },
        'funcOk': function() {
            // report success
            $('.modal#power-cycle h3').text('Success!');
            $('.modal#power-cycle h3').removeClass('error');
            $('.modal#power-cycle button').show();
        },
        'funcFail': function() {
            $('.modal#power-cycle h3').text('Cycle failed.');
            $('.modal#power-cycle h3').addClass('error');
            $('.modal#power-cycle button').show();
        }
    },
    {
        'key': 'CMD_MODBUS_RTU_READ',
        'trigger': 'cmd-mb-rtu-rd',
        'getArgs': function() {
            var args = [];
            $(".mb-rtu-rd").each(function(i, obj) {
                if(typeof(obj.value) == "undefined") {
                    args.push(obj.innerText);
                } else {
                    args.push(obj.value);
                }
            });
            return args;
        },
        'funcOk': function(msg) {
            $(".response-container #rtu-rd").css({'color':'black'});
            $(".response-container #rtu-rd").text(msg);
            $(".response-container #rtu-rd").css({'opacity':0}).animate({'opacity':1});
        },
        'funcFail': function(msg) {
            $(".response-container #rtu-rd").css({'color':'red'});
            $(".response-container #rtu-rd").text("Error: " + msg);
            $(".response-container #rtu-rd").css({'opacity':0}).animate({'opacity':1});
        }
    },
    {
        'key': 'CMD_MODBUS_RTU_WRITE',
        'trigger': 'cmd-mb-rtu-wr',
        'getArgs': function() {
            var args = [];
            $(".mb-rtu-wr").each(function(i, obj) {
                if(typeof(obj.value) == "undefined") {
                    args.push(obj.innerText);
                } else {
                    args.push(obj.value);
                }
            });
            return args;
        },
        'funcOk': function(msg) {
            $(".response-container #rtu-wr").css({'color':'black'});
            $(".response-container #rtu-wr").text("Write successful!");
            $(".response-container #rtu-wr").css({'opacity':0}).animate({'opacity':1});
        },
        'funcFail': function(msg) {
            $(".response-container #rtu-wr").css({'color':'red'});
            $(".response-container #rtu-wr").text("Error: " + msg);
            $(".response-container #rtu-wr").css({'opacity':0}).animate({'opacity':1});
        }
    },
    {
        'key': 'CMD_MODBUS_TCP_READ',
        'trigger': 'cmd-mb-tcp-rd',
        'getArgs': function() {
            var args = [];
            $(".mb-tcp-rd").each(function(i, obj) {
                if(typeof(obj.value) == "undefined") {
                    args.push(obj.innerText);
                } else {
                    args.push(obj.value);
                }
            });
            return args;
        },
        'funcOk': function(msg) {
            $(".response-container #tcp-rd").css({'color':'black'});
            $(".response-container #tcp-rd").text(msg);
            $(".response-container #tcp-rd").css({'opacity':0}).animate({'opacity':1});
        },
        'funcFail': function(msg) {
            $(".response-container #tcp-rd").css({'color':'red'});
            $(".response-container #tcp-rd").text("Error: " + msg);
            $(".response-container #tcp-rd").css({'opacity':0}).animate({'opacity':1});
        }
    },
    {
        'key': 'CMD_MODBUS_TCP_WRITE',
        'trigger': 'cmd-mb-tcp-wr',
        'getArgs': function() {
            var args = [];
            $(".mb-tcp-wr").each(function(i, obj) {
                if(typeof(obj.value) == "undefined") {
                    args.push(obj.innerText);
                } else {
                    args.push(obj.value);
                }
            });
            return args;
        },
        'funcOk': function(msg) {
            $(".response-container #tcp-wr").css({'color':'black'});
            $(".response-container #tcp-wr").text("Write successful!");
            $(".response-container #tcp-wr").css({'opacity':0}).animate({'opacity':1});
        },
        'funcFail': function(msg) {
            $(".response-container #tcp-wr").css({'color':'red'});
            $(".response-container #tcp-wr").text("Error: " + msg);
            $(".response-container #tcp-wr").css({'opacity':0}).animate({'opacity':1});
        }
    },
    {
        'key': 'CMD_GET_LOG_LIST',
        'trigger': '.cmd-getlogs',
        'getArgs': function() {
            var args = [];
            return args;
        },
        'funcOk': function(msg) {
            msg = JSON.parse(msg);
            var logs = [];

            buildTable(logs, msg.logs, "logList", "noData", "logFile");
            attachLogHandlers(app);
            updateTz();
        },
        'funcFail': function() {
            console.log('error for getlogs');
        }
    },
    {
        'key': 'CMD_GET_LOG'
    },
    {
        'key': 'CMD_GET_DATA_LIST',
        'trigger': '.cmd-download-data',
        'getArgs': function() {
            return [];
        },
        'funcOk': function(msg) {
            msg = JSON.parse(msg);
            var buff = [];
            var data = [];

            buildTable(buff, msg.buffer, "data-buffer", "buffer-noData", "dataTmpFile");
            buildTable(data, msg.data, "data-persistent", "persistent-noData", "dataRwFile");
            attachDataHandlers(app);
            updateTz();
        },
        'funcFail': function() {
            console.log('error for download data');
        }
    },
    {
        'key': 'CMD_GET_DATA'
    },
    {
        'key': 'CMD_GET_CONFIG',
        'trigger': 'cmd-download-config',
        'getArgs': function() {
            return [];
        },
        'funcOk': function(msg) {
            console.log('downloaded config succesfully');
            //make the browser download the json instead of viewing it
            var anchor = document.createElement('a');
            anchor.href = "/config.json";
            anchor.target = '_blank';
            anchor.download = "config.json";
            anchor.click();
        },
        'funcFail': function() {
            console.log('error downloading config');
        }
    },
    {
        'key': 'CMD_GET_BLE',
        'trigger': '.cmd-getble',
        'getArgs': function() {
            return [];
        },
        'funcOk': function(msg) {
            var ble_devices = msg.split(',');
            for(var i = 0; i < ble_devices.length; i++)
            {
                addBleDevice(ble_devices[i]);
            }
        },
        'funcFail': function() {
            console.log('error for ble devices');
        }
    },
    {
        'key': 'CMD_DELETE_FILE'
    },
    {
        'key': 'CMD_DOWNLOAD_ALL',
        'trigger': 'cmd-download-all',
        'getArgs': function() {
            return [];
        },
        'funcOk': function(msg) {
            console.log('ok!');
            // redirect to created zip file
            window.location = window.location + "/" + msg + ".tar.gz";
        },
        'funcFail': function() {
            console.log('download all failed');
        }
    },
    {
        'key': 'CMD_DELETE_ALL_DIR'
        // 'trigger': 'cmd-delete-all-log',
        // 'getArgs': function() {
        //     return [];
        // },
        // 'funcOk': function(msg) {
        //     console.log('ok!');
        //     //fade out log list to give feedback
        //     $("#logList").fadeOut();
        //     $(".modal#delete-logs").parent().parent().hide();
        // },
        // 'funcFail': function() {
        //     console.log('delete all failed');
        // }
    }
];

var app = null;
var periodic = null;

function connectWs() {
    // create websocket
    console.log('connecting to ' + window.location.host);
    var url = 'ws://' + window.location.host;
    var ws = new WebSocket(url, 'app');
    ws.onopen = function() {
        $('#status-off').hide();
        $('#status-on').show();
        console.log("connected");
    }
    ws.onmessage = function(msg) {
        try {
            msg = JSON.parse(msg.data);
        } catch(e) {
            msg = {}
            msg.err = "got empty response when connecting to WS"
            console.log("got empty response when connecting to WS")
        }
        if(typeof(msg.ok) != 'undefined') {
            app.funcOk(msg.ok);
            // update nonce
            updateNonce();
        } else if(typeof(msg.err) != 'undefined') {
            if(msg.err != "p") {
                app.funcFail(msg.err);
            } else {
                console.log("periodic");
            }
        }
    }
    ws.onerror = function() {
        console.log('could not connect.');
    }
    ws.onclose = function() {
        $('#status-on').hide();
        $('#status-off').show();
        // if on login page, try to reconnect immediately
        if(!app.loggedIn) {
            // connectWs();
        }
    }
    app = new WebApp('webapp', ws);
}

class WebApp {
    constructor(name, ws) {
        this.name = name;
        this.ws = ws;

        this.sa1 = "";
        this.nonce = "";
        this.loggedIn = false;

        this.timezone = 0;
        this.logsInit = false;

        this.modbus_tcp_profiles = []; //sparse array. 1 where tcp profile is set in row, 0 otherwise

        this.funcOk = function(resp) {
            // this handles the init message from the C code
            var init = JSON.parse(resp);
            app.cfg = JSON.parse(init.cfg);
            app.nonce = init.n;
            app.profiles=init.profiles;
            app.profiles.splice(0,2);
            app.can_profiles = init.can_profiles;
            app.can_profiles.splice(0, 2);
            app.types=["rtu_profile", "tcp_profile"];
            //var profiles=["dm","qw","pt100"];

            //var profile=JSON.parse();

            //add the modbus serial port settings
            var bauds = [
                115200,
                57600,
                38400,
                19200,
                9600,
                4800,
                2400,
                1200,
                600,
                300,
                110
            ];
            var dataBits = [8,7,6,5];
            var parityBits = [1,2];
            var parity = ["N","O","E"];

            if(typeof(app.cfg.modbus) == "undefined") {
                console.log("bad config file");
                return;
            }

            //attach add button event handler
            var addIt=document.getElementById("addSensorBtn");
            if(addIt.addEventListener){
                addIt.addEventListener("click",function(){addSensor();});
            }else if(addIt.attachEvent){
                addIt.attachEvent("onclick", function(){addSensor();});
            }

            addIt = document.getElementById("download-all-log");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    downloadAllInDir("/ps/rw/logs");
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    downloadAllInDir("/ps/rw/logs");
                });
            }

            addIt = document.getElementById("download-all-buffer");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    downloadAllInDir("/tmp/data");
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    downloadAllInDir("/tmp/data");
                });
            }

            addIt = document.getElementById("download-all-persistent");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    downloadAllInDir("/ps/rw/data");
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    downloadAllInDir("/ps/rw/data");
                });
            }

            addIt = document.getElementById("confirm-delete-log");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    deleteAllLogs("/ps/rw/logs", $("#logList"), $(".modal#delete-log"));
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    deleteAllLogs("/ps/rw/logs", $("#logList"), $(".modal#delete-log"));
                });
            }

            addIt = document.getElementById("confirm-delete-buffer");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    deleteAllInDir("/tmp/data", $("#data-buffer"), $(".modal#delete-buffer"));
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    deleteAllInDir("/tmp/data", $("#data-buffer"), $(".modal#delete-buffer"));
                });
            }

            addIt = document.getElementById("confirm-delete-persistent");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    deleteAllInDir("/ps/rw/data", $("#data-persistent"), $(".modal#delete-persistent"));
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    deleteAllInDir("/ps/rw/data", $("#data-persistent"), $(".modal#delete-persistent"));
                });
            }

            addIt = document.getElementById("confirm-delete-bundle");
            if (addIt.addEventListener) {
                addIt.addEventListener("click", function() {
                    deleteAllInDir("/ps/rw/webui", null, $(".modal#delete-bundle"));
                });
            } else if (addIt.attachEvent) {
                addIt.attachEvent("onclick", function() {
                    deleteAllInDir("/ps/rw/webui", null, $(".modal#delete-bundle"));
                });
            }
            var addCan=document.getElementById("addCanSensorBtn");
            if(addCan.addEventListener){
                addCan.addEventListener("click",function(){addCanSensor();});
            }else if(addCan.attachEvent){
                addCan.attachEvent("onclick", function(){addCanSensor();});
            }

            for(var sense in app.cfg.modbus.sensors){
                var d2=document;
                var snsr=app.cfg['modbus']['sensors'];
                var tr1= d2.createElement("tr");
                tr1.id="mb_sensor_tree_"+sense;
                var button=createElementFromHTML("<button id='sensorTrash"+sense+"' ><img title='Delete this' src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA2djE4aDE4di0xOGgtMTh6bTUgMTRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTF2LTEwYzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMXYxMHptNSAwYzAgLjU1Mi0uNDQ4IDEtMSAxcy0xLS40NDgtMS0xdi0xMGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDF2MTB6bTUgMGMwIC41NTItLjQ0OCAxLTEgMXMtMS0uNDQ4LTEtMXYtMTBjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxdjEwem00LTE4djJoLTIwdi0yaDUuNzExYy45IDAgMS42MzEtMS4wOTkgMS42MzEtMmg1LjMxNWMwIC45MDEuNzMgMiAxLjYzMSAyaDUuNzEyeiIvPjwvc3ZnPg=='></button>");

                tr1.appendChild(button);


                button.onclick=function(e){
                    deleteSensor(app.cfg,e.currentTarget.id);
                };


                var td1=d2.createElement("td");
                td1.appendChild(createElementFromHTML("<input type='text' class='cfg' id='modbus-sensors-"+sense+"-name' value='"+ snsr[sense]['name']+"' size='10' required=''>"));
                tr1.appendChild(td1);

                var td2=d2.createElement("td");
                td2.appendChild(createElementFromHTML("<input type='number' class='cfg' id='modbus-sensors-"+sense+"-slave' value='"+snsr[sense]['slave']+"' onchange='assertPositive(this, 0, 254)' min='0' max='254' size='3' required=''>"));

                var td3=d2.createElement("td");
                td3.appendChild(createElementFromHTML("<input type='number' class='cfg' id='modbus-sensors-"+sense+"-delay' value='"+snsr[sense]['delay']+"' onchange='assertPositive(this, 0, null)' min='0' required=''>"));

                var td4=d2.createElement("td");
                td4.appendChild(createElementFromHTML("<input type='number' class='cfg' id='modbus-sensors-"+sense+"-rate' value='"+snsr[sense]['rate']+"' onchange='assertPositive(this, 0, null)' min='0' required=''>"));

                tr1.appendChild(td2);
                tr1.appendChild(td3);
                tr1.appendChild(td4);
                tr1.appendChild(createDropdown("sensors", sense+"-type", app.types, snsr[sense]['type']));
                tr1.appendChild(createDropdown("sensors", sense+"-profile", app.profiles, snsr[sense]['profile']));

                if (snsr[sense]['type'] == "tcp_profile")
                {
                    createModbusTypeFields(d2, tr1, sense, "tcp_profile", snsr[sense]['ip_addr'], snsr[sense]['port']);
                }
                else
                {
                    createModbusTypeFields(d2, tr1, sense, snsr[sense]['type'], "192.168.5.2", 502);
                }
                document.getElementById("sensors").appendChild(tr1);
                createModbusTypeDropdownCallbacks(sense);
            }

            // add can sensors

            for (var sensor in app.cfg.can.sensors) {
                var doc = document;
                var sensor_arr = app.cfg['can']['sensors'];
                var row = doc.createElement("tr");
                row.id = "can_sensor_tree_" + sensor;
                var button=createElementFromHTML("<button id='can-trash-"+sensor+"' ><img title='Delete this' src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMyA2djE4aDE4di0xOGgtMTh6bTUgMTRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTF2LTEwYzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMXYxMHptNSAwYzAgLjU1Mi0uNDQ4IDEtMSAxcy0xLS40NDgtMS0xdi0xMGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDF2MTB6bTUgMGMwIC41NTItLjQ0OCAxLTEgMXMtMS0uNDQ4LTEtMXYtMTBjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxdjEwem00LTE4djJoLTIwdi0yaDUuNzExYy45IDAgMS42MzEtMS4wOTkgMS42MzEtMmg1LjMxNWMwIC45MDEuNzMgMiAxLjYzMSAyaDUuNzEyeiIvPjwvc3ZnPg=='></button>");
                row.appendChild(button);

                button.onclick=function(e){
                    deleteCanSensor(app.cfg,e.currentTarget.id);
                };

                var name_field = doc.createElement("td");
                name_field.appendChild(createElementFromHTML("<input type='text' class='cfg' id='can-sensors-"+sensor+"-name' value='"+ sensor_arr[sensor]['name']+"' size='10' required=''>"));
                row.appendChild(name_field);

                var rate_field = doc.createElement("td");
                rate_field.appendChild(createElementFromHTML("<input type='number' class='cfg' id='can-sensors-"+sensor+"-rate' value='"+sensor_arr[sensor]['rate']+"' onchange='assertPositive(this, 0, null)' min='0' required=''>"));
                row.appendChild(rate_field);

                row.appendChild(createCanDropdown("sensors", sensor+"-profile", app.can_profiles, sensor_arr[sensor]['profile']));
                document.getElementById("can-sensors").appendChild(row);
            }

            var ble_sensors = app.cfg.modbus.servers.internal.ble.devices;
            if(ble_sensors == "") $("#ble-sensors-current").text("None");
            else
            {
                ble_sensors = ble_sensors.split(',');
                $("#ble-sensors-current").text(ble_sensors);
                for(var i = 0; i < ble_sensors.length; i++)
                {
                    addBleDevice(ble_sensors[i]);
                }
            }

            // add modbus settings
            for(var port in app.cfg.modbus) {
                if(port == "RS485") {
                    // add to table
                    var d = document;
                    var mb = app.cfg.modbus[port];
                    var tr = d.createElement("tr");
                    tr.id = port;
                    var nameTh = d.createElement("th");
                    var name = createElementFromHTML("<h3>" + port + "</h3>");
                    nameTh.appendChild(name);
                    tr.appendChild(nameTh);

                    var labelTd = d.createElement("td");
                    var label = createElementFromHTML("<label class=\"check-box\">" +
                        "<h3>Enabled</h3><input type=\"checkbox\" class=\"cfg\" id=\"" +
                        "modbus-" + port + "-enabled" + "\"><span class=\"checkmark\"></span></label>"
                      );
                    labelTd.appendChild(label);
                    tr.appendChild(labelTd);

                    tr.appendChild(createDropdown(port, "baud", bauds, mb['baud']));
                    tr.appendChild(createDropdown(port, "data_bits", dataBits, mb['data_bits']));
                    tr.appendChild(createDropdown(port, "stop_bits", parityBits, mb['stop_bits']));
                    tr.appendChild(createDropdown(port, "parity", parity, mb['parity']));

                    // add the element
                    document.getElementById("serial-ports").appendChild(tr);
                }
            }

            // populate the config options
            var c = 0;
            var path = 0;
            $('.cfg').each(function(i, obj) {
                c = app.cfg;
                path = obj.id.split('-');
                for(var i = 0; i < path.length - 1; i++) {
                    if(typeof(c[path[i]]) != "undefined") {
                        c = c[path[i]];
                    } else {
                        break;
                    }
                }
                if(typeof(c[path[path.length - 1]]) != "undefined") {
                    if(path[path.length - 1] == "urat")
                    {
                        if(c[path[path.length - 1]] == "7")
                        {
                            setInput(obj, "7 - LTE CAT M1 Only")
                        }
                        else if(c[path[path.length - 1]] == "8")
                        {
                            setInput(obj, "8 - LTE NB-IOT Only")
                        }
                        else
                        {
                            setInput(obj, "7,8 - LTE CAT M1 or LTE NB-IOT")
                        }
                    }
                    else if(path[path.length - 1] == "urat3g")
                    {
                        if(c[path[path.length - 1]] == "0")
                        {
                            setInput(obj, "0 - 2G Only")
                        }
                        else if(c[path[path.length - 1]] == "2")
                        {
                            setInput(obj, "2 - 3G Only")
                        }
                        else if(c[path[path.length - 1]] == "1,0")
                        {
                            setInput(obj, "1,0 - 2G/3G, 2G Preferred")
                        }
                        else
                        {
                            setInput(obj, "1,2 - 2G/3G, 3G Preferred")
                        }
                    }
                    else if(path[path.length - 1] == "umnoprof")
                    {
                        if(c[path[path.length - 1]] == 0)
                        {
                            setInput(obj, "Other")
                        }
                        else if(c[path[path.length - 1]] == 2)
                        {
                            setInput(obj, "ATT")
                        }
                        else if(c[path[path.length - 1]] == 3)
                        {
                            setInput(obj, "Verizon")
                        }
                        else if(c[path[path.length - 1]] == 4)
                        {
                            setInput(obj, "Telestra")
                        }
                        else if(c[path[path.length - 1]] == 5)
                        {
                            setInput(obj, "T-Mobile USA")
                        }
                        else if(c[path[path.length - 1]] == 6)
                        {
                            setInput(obj, "China Telecom")
                        }
                        else
                        {
                            setInput(obj, "From SIM Card")
                        }
                    }
                    else if(path[path.length - 1] == "interface")
                    {
                        if(c[path[path.length - 1]] == "wlan0")
                        {
                            setInput(obj, "WiFi")
                        }
                        else if(c[path[path.length - 1]] == "eth0")
                        {
                            setInput(obj, "Ethernet")
                        }
                        else if(c[path[path.length - 1]] == "ppp0")
                        {
                            setInput(obj, "Modem")
                        }
                        else
                        {
                            setInput(obj, "External")
                        }
                    }
                    else
                    {
                        setInput(obj, c[path[path.length - 1]]);
                    }
                } else {
                    // config doesn't have the requested item
                }
            });

            // populate info
            $('.info').each(function(i, obj) {
                c = app.cfg;
                path = obj.id.split('.');
                for(var i = 0; i < path.length - 1; i++) {
                    if(typeof(c[path[i]]) != "undefined") {
                        c = c[path[i]];
                    } else {
                        break;
                    }
                }
                if(typeof(c[path[path.length - 1]]) != "undefined") {
                    document.getElementById(obj.id).innerText = c[path[path.length - 1]];
                } else {
                    // config doesn't have the requested item
                }
            });

            // attach sensor settings handlers
            $("body").click(function() {
                $(".dropdown").removeClass("hover");
            });

            $(".dropdown").click(function(ev) {
                ev.stopPropagation();
                var isHover = this.classList.contains("hover");
                $(".dropdown").removeClass("hover");
                if(!isHover) {
                    $(this).addClass("hover");
                }
            });
            // todo remove
            $(".dropdown ul li").click(function(ev) {
                ev.stopPropagation();
                var dd = $(this).closest(".dropdown");
                dd.find("input").attr('value', ev.target.innerHTML);
                dd.find("p").text(ev.target.innerHTML);
                dd.removeClass("hover");
            });

            // load modals
            $(".btn-modal").click(function(ev) {
                // open the modal window
                $(".modal").hide();
                $(".modal-window").show();
                $(".modal#" + ev.target.id.replace("cmd-", "")).show();
                window.scrollTo(0, 0); //modal only shows up at the top of the screen so you have to scroll to see it
            });

            $(".form-btn-modal").click(function(ev) {
                //only show modal window if form has data in it
                if (ev.target.previousElementSibling.childNodes[1].value != '') {
                    $(".modal").hide();
                    $(".modal-window").show();
                    $(".modal#" + ev.target.id.replace("cmd-", "")).show();
                }
            });

            //special case for btn-apply since it has multiple buttons
            $(".btn-apply").click(function(ev) {
                // open the modal window
                $(".modal").hide();
                $(".modal-window").show();
                $(".modal#apply").show();
                window.scrollTo(0, 0); //modal only shows up at the top of the screen so you have to scroll to see it
            });

            $(".modal-window").click(function() {
                $(this).hide();
            });
            $(".modal").click(function(ev) {
                ev.stopPropagation();
            });
            $(".btn-modal-close").click(function() {
                $(".modal-window").hide();
            });
        }

        this.funcFail = function() {
            console.log('command failed');
        }

        this.CMD = {};
        for(var i = 0; i < commands.length; i++) {
            this.CMD[commands[i].key] = i;
        }

        this.getLog = function(app, onOk, onErr, file) {
            console.log(app)
            sendCmd(app, app.CMD.CMD_GET_LOG, [file], onOk, onErr);
        }

        this.getData = function(app, onOk, onErr, file) {
            console.log(app)
            sendCmd(app, app.CMD.CMD_GET_DATA, [file], onOk, onErr);
        }

        if(periodic != null) clearInterval(periodic);
        var _this = this;
        periodic = setInterval(function() {
            console.log('a')
            sendCmd(_this, _this.CMD.CMD_GET_PERIODIC, [], function(){}, function(){});
        }, 5000);
    }
}

function replaceAt(str, i, substr) {
    return str.substring(0, i) + substr + str.substring(i + substr.length);
}

function updateNonce() {
    var count = app.nonce.substring(0,8);
    for(var i = 0; i < 9; i++) {
        var code = count[i].charCodeAt();
        if(code < 126) {
            // increment
            count = replaceAt(count,i,String.fromCharCode(code + 1));
            for(var j = i - 1; j >= 0; j--) {
                // set all previous to zero
                count = replaceAt(count,j,'0');
            }
            break;
        }
    }
    app.nonce = count.concat(app.nonce.substring(8,app.nonce.length));
}

function calcHash() {
    return sha256(app.sa1 + app.nonce);
}

function getValue(obj) {
    if(typeof(obj.value) == "undefined") {
        return obj.innerText;
    }
    return obj.value;
}

// date - string
//
function setTimezone(date, zone) {
    var d = new Date(Date.parse(date));
    var hours = zone - app.timezone;
    var minutes = Math.round(100 * (hours % 1));

    d.setHours(d.getHours() + parseInt(hours), d.getMinutes() + minutes);
    return d.toString().split(' GMT')[0];
}

function setFileDates(zone, name) {
    $('.data-table table tr').each(function() {
        var dateElem = $(this).find('th');
        dateElem.text(setTimezone(dateElem.text(), zone));
    });
    app.timezone = zone;
    $('.tz-selector .field p').text(name);
}

$(document).ready(function() {
    $('.page').hide();
    $('.page#status').show();
    console.log('starting...');

    // connectWs();
    $("#eth-ip").text(window.location.host);

    $('#btn-connect').click(function() {
        window.location.reload(false);
    });

    $(".error-area li").hide();
    // attach navigation handlers
    attachNavBars(app);
    // attach button handlers
    attachHandlers(app);
    // timezone picker
    $('.tz-selector li').click(function() {
        var tz = $(this).val();
        var name = $(this).text();
        setFileDates(tz, name);
    });
});

function attachNavBars(app) {
    $('#navbar li').click(function(ev) {
        // hide all pages
        $('.page').hide();
        $('#navbar li').removeClass('active');
        // show correct page
        $('.page#' + ev.target.id).show();
        $('#navbar li#' + ev.target.id).addClass('active');
    });
    $('#settings-nav li').click(function(ev) {
        // hide all pages
        $('.subpage').hide();
        $('#settings-nav li').removeClass('active');
        // show correct page
        $('.subpage#' + ev.target.id).show();
        $('#settings-nav li#' + ev.target.id).addClass('active');
    });
}

function addClassHandler(app, cmd, name, trigger, i) {
    $(trigger).click(function(ev) {
        $(".error-area li").hide();
        ev.preventDefault();
        //console.log('[' + app.name + '] ' + name);
        sendCmd(app, i, cmd.getArgs(), cmd.funcOk, cmd.funcFail);
    });
}

function addHandler(app, cmd, name, trigger, i) {
    $('#' + trigger).click(function(ev) {
        $(".error-area li").hide();
        ev.preventDefault();
        //console.log('[' + app.name + '] ' + name);
        sendCmd(app, i, cmd.getArgs(), cmd.funcOk, cmd.funcFail);
    });
}

function attachHandlers(app) {
    for(var i = 0; i < commands.length; i++) {
        var cmd = commands[i];
        if(typeof(cmd.trigger) != "undefined" && cmd.trigger.startsWith('.')) {
            addClassHandler(app, cmd, cmd.key, cmd.trigger, i);
        } else {
            addHandler(app, cmd, cmd.key, cmd.trigger, i);
        }
    };
}

function sendCmd(app, cmd, args, success, failure) {
    //console.log('[' + app.name + '] sending command \'' + cmd + '\'...');
    if(typeof(args) == 'undefined') {
        args = [];
    } else if(args == -1) {
        return; // error
    }
    var arr = {
        'auth': calcHash(),
        'cmd': cmd,
        'sz': args.length,
        'args': args
    }
    if(cmd != app.CMD.CMD_GET_PERIODIC) {
        app.funcOk = success;
        app.funcFail = failure;
    }
    app.ws.send(JSON.stringify(arr));
}

function setText(id, text) {
    $('#' + id).text(text);
}

function setInput(obj, text) {
    if(obj.nodeName == "INPUT") {
        switch(obj.type) {
            default:
                $('#' + obj.id).attr('value', text);
                break;
            case 'checkbox':
                obj.checked = text;
                break;
        }
    } else {
        obj.innerText = text;
    }
}
