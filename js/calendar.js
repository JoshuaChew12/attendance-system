let currentMonth = new Date().toISOString().slice(0,7);
let calendarData = [];

// ===============================
// PAGE LIFECYCLE
// ===============================
function onCalendarShow(){
    resetCalendarUI();
    loadCalendar();
}

function onCalendarHide(){
    // nothing heavy needed
}

// ===============================
// RESET UI
// ===============================
function resetCalendarUI(){

    document.getElementById("calendarGrid").innerHTML = "Loading...";
    document.getElementById("monthTitle").innerHTML = currentMonth;
}

// ===============================
// FORMAT MONTH
// ===============================
function formatMonth(m){
    const p = m.split("-");
    return p[0] + "-" + String(p[1]).padStart(2,"0");
}

// ===============================
// LOAD CALENDAR
// ===============================
async function loadCalendar(){

    const user = JSON.parse(localStorage.getItem("user"));
    if(!user) return;

    document.getElementById("monthTitle").innerHTML = formatMonth(currentMonth);

    try{

        const res = await apiGet({
            action:"getMonthlyAttendance",
            employee_id:user.employee_id,
            month:formatMonth(currentMonth)
        });

        if(res.success){
            calendarData = res.data || [];
            renderCalendar();
        }

    }catch(err){
        console.log("Calendar Error", err);
        document.getElementById("calendarGrid").innerHTML = "API Error";
    }
}

// ===============================
// RENDER CALENDAR
// ===============================
function renderCalendar(){

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    const year = Number(currentMonth.split("-")[0]);
    const month = Number(currentMonth.split("-")[1]);

    const firstDay = new Date(year, month-1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();

    for(let i=0;i<firstDay;i++){
        const empty = document.createElement("div");
        empty.className = "day empty";
        grid.appendChild(empty);
    }

    for(let i=1;i<=totalDays;i++){

        const date = `${currentMonth}-${String(i).padStart(2,"0")}`;

        const record = calendarData.find(d => d.date === date);

        const div = document.createElement("div");
        div.className = "day";
        div.innerHTML = i;

        if(record){

            if(record.status === "Present") div.classList.add("present-day");
            else if(record.status === "Late") div.classList.add("late-day");
            else if(record.status === "Absent") div.classList.add("absent-day");

        }

        div.onclick = () => showDetail(date);

        grid.appendChild(div);
    }
}

// ===============================
// DETAIL
// ===============================
async function showDetail(date){

    const user = JSON.parse(localStorage.getItem("user"));

    const res = await apiGet({
        action:"getAttendanceByDate",
        employee_id:user.employee_id,
        date
    });

    const box = document.getElementById("detailBox");

    if(res.success && res.data){

        const d = res.data;

        box.innerHTML = `
            <div>${d.date}</div>
            <div>Day: ${d.day}</div>
            <div>Check In: ${d.checkIn || "-"}</div>
            <div>Check Out: ${d.checkOut || "-"}</div>
            <div>Work Hours: ${d.workHours || 0} hrs</div>
            <div>Late: ${d.lateMinutes || 0} min</div>
            <div>Status: ${d.status || "-"}</div>
        `;

    } else {
        box.innerHTML = "No Attendance Record";
    }
}

// ===============================
// MONTH CONTROL
// ===============================
function prevMonth(){

    let d = new Date(currentMonth+"-01");
    d.setMonth(d.getMonth()-1);

    currentMonth = d.toISOString().slice(0,7);
    onCalendarShow();
}

function nextMonth(){

    let d = new Date(currentMonth+"-01");
    d.setMonth(d.getMonth()+1);

    currentMonth = d.toISOString().slice(0,7);
    onCalendarShow();
}

// auto init
onCalendarShow();
