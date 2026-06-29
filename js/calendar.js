
let currentMonth =
new Date().toISOString().slice(0,7);

let calendarData = [];


// =========================
// LOAD MONTH DATA
// =========================
async function loadCalendar(){

  const user = JSON.parse(localStorage.getItem("user"));

  document.getElementById("monthTitle").innerHTML = currentMonth;

  const res = await apiGet({

    action: "getMonthlyAttendance",
    employee_id: user.employee_id,
    month: currentMonth

  });

  if(res.success){
    calendarData = res.data;
    renderCalendar();
  }

}


// =========================
// RENDER GRID
// =========================
function renderCalendar(){

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const daysInMonth = new Date(
    currentMonth.split("-")[0],
    currentMonth.split("-")[1],
    0
  ).getDate();

  for(let i=1;i<=daysInMonth;i++){

    const date =
      `${currentMonth}-${String(i).padStart(2,'0')}`;

    const record =
      calendarData.find(d => d.date === date);

    let color = "gray";

    if(record){

      if(record.status === "Present") color = "green";
      if(record.status === "Late") color = "yellow";
      if(record.status === "Absent") color = "red";

    }

    const div = document.createElement("div");

    div.className = "day " + color;

    div.innerHTML = i;

    div.onclick = () => showDetail(date);

    grid.appendChild(div);

  }

}


// =========================
// SHOW DAILY DETAIL
// =========================
async function showDetail(date){

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await apiGet({

    action: "getAttendanceByDate",
    employee_id: user.employee_id,
    date: date

  });

  const box = document.getElementById("detailBox");

  if(res.success && res.data){

    const d = res.data;

    box.innerHTML = `
      <b>Date:</b> ${d.date}<br>
      <b>Day:</b> ${d.day}<br><br>

      <b>Check In:</b> ${d.checkIn || "-"}<br>
      <b>Check Out:</b> ${d.checkOut || "-"}<br><br>

      <b>Work Hours:</b> ${d.workHours || 0}<br>
      <b>Late:</b> ${d.lateMinutes || 0} min<br>
      <b>Early Leave:</b> ${d.earlyLeaveMinutes || 0} min<br><br>

      <b>Status:</b> ${d.status}
    `;

  }else{

    box.innerHTML = "No record";

  }

}


// =========================
// MONTH NAV
// =========================
function prevMonth(){

  let d = new Date(currentMonth + "-01");
  d.setMonth(d.getMonth()-1);
  currentMonth = d.toISOString().slice(0,7);
  loadCalendar();

}

function nextMonth(){

  let d = new Date(currentMonth + "-01");
  d.setMonth(d.getMonth()+1);
  currentMonth = d.toISOString().slice(0,7);
  loadCalendar();

}


// INIT
loadCalendar();
