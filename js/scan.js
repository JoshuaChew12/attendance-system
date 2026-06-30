let scannedBranch = "";
let scanner = null;
let isProcessing = false;


// =========================
// QR SUCCESS CALLBACK
// =========================
function qrSuccess(decodedText) {

  if (isProcessing) return;

  scannedBranch = decodedText;

  document.getElementById("scanStatus").innerHTML =
    "Branch detected: " + decodedText;

  // 自动开始打卡流程
  autoAttendance();
}


// =========================
// START SCANNER
// =========================
function startScanner() {

  scanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: 250
    }
  );

  scanner.render(qrSuccess);
}

startScanner();


// =========================
// GPS LOCATION
// =========================
function getLocation() {

  return new Promise((resolve, reject) => {

    if (!navigator.geolocation) {
      reject(new Error("GPS not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });

      },

      (error) => {
        reject(new Error("GPS permission denied"));
      },

      {
        enableHighAccuracy: true,
        timeout: 10000
      }

    );

  });

}


// =========================
// AUTO ATTENDANCE CONTROLLER
// =========================
async function autoAttendance() {

  try {

    if (isProcessing) return;
    isProcessing = true;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      throw new Error("User not found");
    }

    document.getElementById("scanStatus").innerHTML =
      "Checking attendance...";

    // 1. check today status from backend
    const status = await apiGet({
      action: "getTodayAttendance",
      employee_id: user.employee_id
    });

    // 2. IF already checked in → CHECK OUT
    if (status.success && status.exists) {

      await autoCheckOut(user);

    } 
    // 3. ELSE → CHECK IN
    else {

      if (!scannedBranch) {
        throw new Error("QR not detected");
      }

      await autoCheckIn(user);

    }

  } catch (error) {

    showError(error.message);

  }

}


// =========================
// AUTO CHECK IN
// =========================
async function autoCheckIn(user) {

  try {

    document.getElementById("scanStatus").innerHTML =
      "Getting location...";

    const gps = await getLocation();

    document.getElementById("scanStatus").innerHTML =
      "Submitting check-in...";

    const result = await apiPost({
      action: "checkIn",
      employee_id: user.employee_id,
      branch_id: scannedBranch,
      lat: gps.lat,
      lng: gps.lng
    });

    if (result.success) {

      successUI("Check In Successful");

      stopScanner();

      refreshDashboard();

    } else {

      showError(result.message);

    }

  } catch (error) {

    showError(error.message);

  }

}


// =========================
// AUTO CHECK OUT
// =========================
async function autoCheckOut(user) {

  try {

    document.getElementById("scanStatus").innerHTML =
      "Processing check-out...";

    const gps = await getLocation();

    const result = await apiPost({
      action: "checkOut",
      employee_id: user.employee_id,
      lat: gps.lat,
      lng: gps.lng
    });

    if (result.success) {

      let text =
        "Check Out Successful\n" +
        "Work Hours: " +
        result.data.workHours +
        " hrs";

      successUI(text);

      stopScanner();

      refreshDashboard();

    } else {

      showError(result.message);

    }

  } catch (error) {

    showError(error.message);

  }

}


// =========================
// STOP CAMERA
// =========================
function stopScanner() {

  try {

    if (scanner) {
      scanner.clear();
    }

  } catch (e) {
    console.log(e);
  }

}


// =========================
// UI HELPERS
// =========================
function successUI(message) {

  document.getElementById("statusIcon").innerHTML = "✅";

  document.getElementById("scanStatus").innerHTML = message;

  document.getElementById("scanTime").innerHTML =
    new Date().toLocaleTimeString();

  isProcessing = false;

}


function showError(message) {

  document.getElementById("statusIcon").innerHTML = "❌";

  document.getElementById("scanStatus").innerHTML = message;

  isProcessing = false;

}


// =========================
// REFRESH DASHBOARD FLAG
// =========================
function refreshDashboard() {

  localStorage.setItem("refreshDashboard", Date.now());

}


// =========================
// RESTART SCANNER
// =========================
function restartScanner() {

  location.reload();

}
