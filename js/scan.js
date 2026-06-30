let qrScanner = null;
let scannedBranch = "";
let isProcessing = false;

// =====================================================
// INIT CAMERA
// =====================================================
async function startScanner(){

console.log("Starting QR Scanner");

const reader=document.getElementById("reader");
if(!reader||qrScanner) return;

qrScanner=new Html5Qrcode("reader");

try{

const cameras=await Html5Qrcode.getCameras();
if(!cameras?.length) throw new Error("No camera found");

// enterprise camera selection
let cameraId=
cameras.find(c=>/back|rear|environment/i.test(c.label))?.id
|| cameras[cameras.length-1].id;

await qrScanner.start(
cameraId,
{fps:10,qrbox:{width:250,height:250}},
qrSuccess,
()=>{}
);

console.log("Camera Started");

}catch(err){

console.log("Camera Error",err);
showResult("❌",err.message);

}

}

// =====================================================
// QR SUCCESS
// =====================================================
function qrSuccess(decodedText){

if(isProcessing)
return;

isProcessing=true;

scannedBranch =
decodedText;

stopScanner();

// hide camera

document.getElementById(
"cameraPage"
).style.display="none";

// show result

document.getElementById(
"resultPage"
).style.display="block";

showResult(
"⏳",
"Checking..."
);

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

if(!user){

throw Error(
"User not found"
);

}

const status =
await apiGet({
action:
"getTodayAttendance",
employee_id:
user.employee_id
});

if(
status.success &&
status.exists
){

await checkOut(user);

}

else{

await checkIn(user);

}

}
catch(err){

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
lat:
gps.lat,
lng:
gps.lng
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

}
catch(err){

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
lat:
gps.lat,
lng:
gps.lng

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

}
catch(err){

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
async function stopScanner(){

try{

if(qrScanner){

await qrScanner.stop();

await qrScanner.clear();

qrScanner=null;

console.log(
"Camera stopped"
);

}

}
catch(err){

console.log(
"Stop camera error",
err
);

qrScanner=null;

}

}

// =====================================================
// RESULT UI
// =====================================================
function showResult(icon,text){

const iconBox =
document.getElementById(
"statusIcon"
);

const result =
document.getElementById(
"scanResult"
);

const time =
document.getElementById(
"scanTime"
);

if(iconBox)
iconBox.innerHTML=icon;

if(result)
result.innerHTML=text;

if(time)

time.innerHTML =
new Date()
.toLocaleTimeString(
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
