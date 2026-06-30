window.scanner=null;
let scannedBranch = "";
let isProcessing = false;
// =====================================================
// START CAMERA
// =====================================================
function startScanner(){

if(scanner){
return;
}

scanner =
new Html5QrcodeScanner(
"reader",
{
fps:10,
qrbox:250
}
);

scanner.render(
qrSuccess
);

}

// =====================================================
// QR SUCCESS
// =====================================================
function qrSuccess(decodedText){

if(isProcessing)
return;

isProcessing=true;

scannedBranch=decodedText;

// STOP CAMERA FIRST

stopScanner();

// HIDE CAMERA

document.getElementById(
"cameraPage"
).style.display="none";

// SHOW RESULT

document.getElementById(
"resultPage"
).style.display="block";

document.getElementById(
"statusIcon"
).innerHTML="⏳";

document.getElementById(
"scanResult"
).innerHTML=
"Checking...";

// START PROCESS

autoAttendance();

}

// =====================================================
// MAIN CONTROLLER
// =====================================================
async function autoAttendance(){

try{

const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user)
throw Error(
"User not found"
);

// CHECK TODAY STATUS
const status =
await apiGet({
action:"getTodayAttendance",
employee_id:user.employee_id
});

if(
status.success &&
status.exists
){

// HAS CHECK IN
await checkOut(user);

}

else{
// NEW CHECK IN
await checkIn(user);
}

}catch(err){

showResult(

"❌",

err.message

);

}

}

// =====================================================
// CHECK IN
// =====================================================
async function checkIn(user){

try{

showResult(

"⏳",

"Getting GPS..."

);

const gps =
await getLocation();

const result =
await apiPost({

action:"checkIn",
employee_id:
user.employee_id,
branch_id:
scannedBranch,
lat:gps.lat,
lng:gps.lng

});

if(result.success){

showResult(

"✅",

"Check In Successful"

);

}

else{

showResult(

"❌",

result.message

);

}

}catch(err){

showResult(

"❌",

err.message

);

}

}

// =====================================================
// CHECK OUT
// =====================================================
async function checkOut(user){

try{

showResult(

"⏳",

"Checking Out..."

);

const gps =
await getLocation();

const result =
await apiPost({

action:"checkOut",
employee_id:
user.employee_id,
lat:gps.lat,
lng:gps.lng

});

if(result.success){

showResult(

"✅",

"Check Out Successful\nWork Hours: "
+
result.data.workHours
+
" hrs"

);

}

else{

showResult(

"❌",

result.message

);

}

}catch(err){

showResult(

"❌",

err.message

);

}

}

// =====================================================
// GPS
// =====================================================
function getLocation(){

return new Promise(

(resolve,reject)=>{

if(!navigator.geolocation){

reject(
new Error(
"GPS not supported"
)
);

return;

}

navigator.geolocation.getCurrentPosition(

(position)=>{

resolve({

lat:
position.coords.latitude,

lng:
position.coords.longitude

});

},

()=>{

reject(
new Error(
"GPS permission denied"
)
);

},

{

enableHighAccuracy:true,

timeout:10000

}

);

}

);

}

// =====================================================
// STOP CAMERA
// =====================================================
function stopScanner(){

try{

if(scanner){
scanner.clear();
scanner=null;
}

}catch(e){

console.log(e);

}

}

// =====================================================
// RESULT UI
// =====================================================
function showResult(icon,text){

document.getElementById(
"statusIcon"
).innerHTML=icon;

document.getElementById(
"scanResult"
).innerHTML=text;

document.getElementById(
"scanTime"
).innerHTML=

new Date().toLocaleTimeString(
"en-MY",
{
timeZone:
"Asia/Kuala_Lumpur"
}

);

isProcessing=false;

}

// =====================================================
// RESTART
// =====================================================
function restartScanner(){

location.reload();

}
