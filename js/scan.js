let scanner = null;
let scannedBranch = "";
let isProcessing = false;

// ===============================
// PAGE LIFECYCLE
// ===============================
function onScanShow(){
    resetUI();
    startScanner();
}

function onScanHide(){
    stopScanner();
}

// ===============================
// RESET UI
// ===============================
function resetUI(){
    isProcessing = false;
    scannedBranch = "";

    document.getElementById("cameraPage").style.display = "block";
    document.getElementById("resultPage").style.display = "none";

    document.getElementById("statusIcon").innerHTML = "📷";
    document.getElementById("scanResult").innerHTML = "Waiting...";
}

// ===============================
// START CAMERA
// ===============================
function startScanner(){

    if(scanner){
        scanner.clear();
        scanner = null;
    }

    scanner = new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,
            qrbox: 250
        },
        false
    );

    scanner.render(qrSuccess);
}

// ===============================
// QR SUCCESS
// ===============================
function qrSuccess(decodedText){

    if(isProcessing) return;

    isProcessing = true;
    scannedBranch = decodedText;

    stopScanner();

    document.getElementById("cameraPage").style.display = "none";
    document.getElementById("resultPage").style.display = "block";

    document.getElementById("statusIcon").innerHTML = "⏳";
    document.getElementById("scanResult").innerHTML = "Checking...";

    autoAttendance();
}

// ===============================
// AUTO ATTENDANCE
// ===============================
async function autoAttendance(){

    try{

        const user = JSON.parse(localStorage.getItem("user"));
        if(!user) throw new Error("User not found");

        const status = await apiGet({
            action:"getTodayAttendance",
            employee_id:user.employee_id
        });

        if(status.success && status.exists){
            await checkOut(user);
        } else {
            await checkIn(user);
        }

    }catch(err){
        showResult("❌", err.message);
    }
}

// ===============================
// CHECK IN
// ===============================
async function checkIn(user){

    try{

        showResult("⏳", "Getting GPS...");

        const gps = await getLocation();

        const result = await apiPost({
            action:"checkIn",
            employee_id:user.employee_id,
            branch_id:scannedBranch,
            lat:gps.lat,
            lng:gps.lng
        });

        if(result.success){
            showResult("✅", "Check In Successful");
        } else {
            showResult("❌", result.message);
        }

    }catch(err){
        showResult("❌", err.message);
    }
}

// ===============================
// CHECK OUT
// ===============================
async function checkOut(user){

    try{

        showResult("⏳", "Checking Out...");

        const gps = await getLocation();

        const result = await apiPost({
            action:"checkOut",
            employee_id:user.employee_id,
            lat:gps.lat,
            lng:gps.lng
        });

        if(result.success){
            showResult(
                "✅",
                "Check Out Successful\nWork Hours: " + result.data.workHours + " hrs"
            );
        } else {
            showResult("❌", result.message);
        }

    }catch(err){
        showResult("❌", err.message);
    }
}

// ===============================
// GPS
// ===============================
function getLocation(){

    return new Promise((resolve, reject)=>{

        if(!navigator.geolocation){
            reject(new Error("GPS not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos)=>{
                resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            ()=>{
                reject(new Error("GPS permission denied"));
            },
            {
                enableHighAccuracy:true,
                timeout:10000
            }
        );

    });

}

// ===============================
// STOP CAMERA (FIXED)
// ===============================
function stopScanner(){

    try{
        if(scanner){
            scanner.clear().catch(()=>{});
            scanner = null;
        }
    }catch(e){
        console.log(e);
    }
}

// ===============================
// RESULT UI
// ===============================
function showResult(icon,text){

    document.getElementById("statusIcon").innerHTML = icon;
    document.getElementById("scanResult").innerHTML = text;

    document.getElementById("scanTime").innerHTML =
        new Date().toLocaleTimeString("en-MY", {
            timeZone:"Asia/Kuala_Lumpur"
        });

    isProcessing = false;
}

// ===============================
// RESTART
// ===============================
function restartScanner(){
    resetUI();
    startScanner();
}

// auto init
onScanShow();
