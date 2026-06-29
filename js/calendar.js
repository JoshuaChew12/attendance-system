
let currentMonth = new Date().toISOString().slice(0,7);
let calendarData = [];


async function loadCalendar(){

  console.log("Calendar loading...");

  const user = JSON.parse(localStorage.getItem("user"));

  if(!user){
    alert("No user found");
    return;
  }

  document.getElementById("monthTitle").innerHTML = currentMonth;

  try{

    const res = await apiGet({
      action: "getMonthlyAttendance",
      employee_id: user.employee_id,
      month: currentMonth
    });

    console.log("API response:", res);

    if(res.success){
      calendarData = res.data || [];
      renderCalendar();
    }else{
      alert(res.message);
    }

  }catch(err){
    console.error(err);
    alert("API error: " + err.message);
  }

}


function renderCalendar(){

  const grid = document.getElementById("calendarGrid");

  if(!grid){
    alert("calendarGrid NOT FOUND in HTML");
    return;
  }

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

  console.log("Calendar rendered OK");

}


async function showDetail(date){

  const user = JSON.parse(localStorage.getItem("user"));

  const res = await apiGet({
    action: "getAttendanceByDate",
    employee_id: user.employee_id,
    date: date
  });

  const box = document.getElementById("detailBox");

  if(res.success && res.data){

    box.innerHTML = `
      <b>Date:</b> ${res.data.date}<br>
      <b>Status:</b> ${res.data.status}<br>
      <b>Check In:</b> ${res.data.checkIn}<br>
      <b>Check Out:</b> ${res.data.checkOut}<br>
      <b>Work Hours:</b> ${res.data.workHours}
    `;

  }else{
    box.innerHTML = "No record";
  }

}


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


// 🔥 FORCE RUN
document.addEventListener("DOMContentLoaded", loadCalendar);
