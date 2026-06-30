let scanner = null;
let scannedBranch = "";
let isProcessing = false;

// =========================
// INIT PAGE
// =========================
function initScanPage() {
  resetScanUI();

  scanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: 250 }
  );

  scanner.render(qrSuccess);
}

// =========================
// DESTROY PAGE (VERY IMPORTANT)
// =========================
function destroyScanPage() {
  try {
    if (scanner) {
      scanner.clear().then(() => {
        scanner = null;
      });
    }
  } catch (e) {
    console.log("destroyScanPage error", e);
  }

  scannedBranch = "";
  isProcessing = false;

  const reader = document.getElementById("reader");
  if (reader) reader.innerHTML = "";
}

// =========================
// RESET UI
// =========================
function resetScanUI() {
  const camera = document.getElementById("cameraPage");
  const result = document.getElementById("resultPage");

  if (camera) camera.style.display = "block";
  if (result) result.style.display = "none";

  const icon = document.getElementById("statusIcon");
  const text = document.getElementById("scanResult");

  if (icon) icon.innerHTML = "📷";
  if (text) text.innerHTML = "Waiting for scan...";
}

// =========================
// QR SUCCESS
// =========================
function qrSuccess(decodedText) {
  if (isProcessing) return;
  isProcessing = true;

  scannedBranch = decodedText;

  stopScanner();

  document.getElementById("cameraPage").style.display = "none";
  document.getElementById("resultPage").style.display = "block";

  document.getElementById("statusIcon").innerHTML = "⏳";
  document.getElementById("scanResult").innerHTML = "Checking...";

  autoAttendance();
}

// =========================
// AUTO ATTENDANCE (UNCHANGED LOGIC)
// =========================
async function autoAttendance() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) throw Error("User not found");

    const status = await apiGet({
      action: "getTodayAttendance",
      employee_id: user.employee_id
    });

    if (status.success && status.exists) {
      await checkOut(user);
    } else {
      await checkIn(user);
    }

  } catch (err) {
    showResult("❌", err.message);
  }
}

// =========================
// CHECK IN / OUT (UNCHANGED)
// =========================
async function checkIn(user) {
  try {
    showResult("⏳", "Getting GPS...");
    const gps = await getLocation();

    const result = await apiPost({
      action: "checkIn",
      employee_id: user.employee_id,
      branch_id: scannedBranch,
      lat: gps.lat,
      lng: gps.lng
    });

    showResult(
      result.success ? "✅" : "❌",
      result.success ? "Check In Successful" : result.message
    );

  } catch (err) {
    showResult("❌", err.message);
  }
}

async function checkOut(user) {
  try {
    showResult("⏳", "Checking Out...");
    const gps = await getLocation();

    const result = await apiPost({
      action: "checkOut",
      employee_id: user.employee_id,
      lat: gps.lat,
      lng: gps.lng
    });

    showResult(
      result.success ? "✅" : "❌",
      result.success
        ? "Check Out Successful\nWork Hours: " + result.data.workHours + " hrs"
        : result.message
    );

  } catch (err) {
    showResult("❌", err.message);
  }
}

// =========================
// GPS
// =========================
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("GPS not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => reject(new Error("GPS permission denied")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
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
// UI
// =========================
function showResult(icon, text) {
  document.getElementById("statusIcon").innerHTML = icon;
  document.getElementById("scanResult").innerHTML = text;

  document.getElementById("scanTime").innerHTML =
    new Date().toLocaleTimeString("en-MY", {
      timeZone: "Asia/Kuala_Lumpur"
    });

  isProcessing = false;
}

// =========================
// RESTART
// =========================
function restartScanner() {
  destroyScanPage();
  initScanPage();
}

// IMPORTANT: REMOVE auto start
// ❌ startScanner();

// SPA HOOK
initScanPage();
