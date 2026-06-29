let currentMonth = new Date().toISOString().slice(0,7);
let calendarData = [];


// =========================
// FORMAT MONTH (防 2026-6 bug)
// =========================
function formatMonth(m){

  if(!m) return "";

  const parts = m.split("-");

  return parts[0] + "-" + String(parts[1]).padStart(2,"0");

}


// =========================
// LOAD CALENDAR DATA
// =========================
async function loadCalendar(){

  console.log("📅 Calendar loading...");

  const user = JSON.parse(localStorage.getItem("user"));

  if(!user){
    alert("No user found in localStorage");
    return;
  }

  document.getElementById("monthTitle").innerHTML = currentMonth;

  try{

    const res = await apiGet({
      action: "getMonthlyAttendance",
      employee_id: user.employee_id,
      month: formatMonth(currentMonth)
    });

    console.log("📡 API Response:", res);

    if(res && res.success){

      calendarData = res.data || [];
      renderCalendar();

    }else{

      alert(res?.message || "API failed");

    }

  }catch(err){

    console.error("❌ Calendar API Error:", err);

    alert("API error: " + err.message);

  }

}


// =========================
// RENDER CALENDAR GRID
// =========================
function renderCalendar(){

  const grid = document.getElementById("calendarGrid");

  if(!grid){
    alert("❌ calendarGrid not found in HTML");
    return;
  }

  grid.innerHTML = "";

  const year = Number(currentMonth.split("-")[0]);
  const month = Number(currentMonth.split("-")[1]);

  const daysInMonth = new Date(year, month, 0).getDate();

  for(let i=1;i<=daysInMonth;i++){

    const date = `${currentMonth}-${String(i).padStart(2,'0')}`;

    const record = calendarData.find(d => d.date === date);

    let color = "gray";

    if(record){

      const status = record.status;

      if(status === "Present") color = "green";
      else if(status === "Late") color = "yellow";
      else if(status === "Absent") color = "red";
      else color = "gray";

    }

    const div = document.createElement("div");

    div.className = "day " + color;
    div.innerText = i;

    div.onclick = () => showDetail(date);

    grid.appendChild(div);

  }

  console.log("✅ Calendar rendered:", daysInMonth, "days");

}


// =========================
// SHOW DAY DETAIL
// =========================
async function showDetail(date){

  try{

    const user = JSON.parse(localStorage.getItem("user"));

    const res = await apiGet({
      action: "getAttendanceByDate",
      employee_id: user.employee_id,
      date: date
    });

    const box = document.getElementById("detailBox");

    if(res && res.success && res.data){

      const d = res.data;

      box.innerHTML = `
        <b>Date:</b> ${d.date || "-"}<br>
        <b>Day:</b> ${d.day || "-"}<br><br>

        <b>Check In:</b> ${d.checkIn || "-"}<br>
        <b>Check Out:</b> ${d.checkOut || "-"}<br><br>

        <b>Work Hours:</b> ${d.workHours || 0}<br>
        <b>Late:</b> ${d.lateMinutes || 0} min<br>
        <b>Early Leave:</b> ${d.earlyLeaveMinutes || 0} min<br><br>

        <b>Status:</b> ${d.status || "-"}
      `;

    }else{

      box.innerHTML = "No record";

    }

  }catch(err){

    console.error(err);

    document.getElementById("detailBox").innerHTML =
      "Error loading detail";

  }

}


// =========================
// MONTH NAVIGATION
// =========================
function prevMonth(){

  let d = new Date(currentMonth + "-01");
  d.setMonth(d.getMonth() - 1);

  currentMonth = d.toISOString().slice(0,7);

  loadCalendar();

}


function nextMonth(){

  let d = new Date(currentMonth + "-01");
  d.setMonth(d.getMonth() + 1);

  currentMonth = d.toISOString().slice(0,7);

  loadCalendar();

}


// =========================
// AUTO INIT
// =========================
document.addEventListener("DOMContentLoaded", loadCalendar);
