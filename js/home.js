async function loadHome(){

  const user = JSON.parse(localStorage.getItem("user"));

  if(!user) return;

  // =========================
  // UI basic info
  // =========================
  document.getElementById("employeeName").innerHTML = user.employee_id;
  document.getElementById("branchName").innerHTML = user.branch_id;


  // =========================
  // Dashboard stats
  // =========================
  const dash = await apiGet({
    action: "getDashboard",
    branch: user.branch_id
  });

  if(dash.success){
    document.getElementById("present").innerHTML = dash.data.present;
    document.getElementById("late").innerHTML = dash.data.late;
  }


  // =========================
  // TODAY RECORD
  // =========================
  const today = await apiGet({
    action: "getTodayAttendance",
    employee_id: user.employee_id
  });


  if(today.success && today.exists){

    const record = today.record;

    document.getElementById("checkIn").innerHTML = record.checkIn || "--:--";
    document.getElementById("checkOut").innerHTML = record.checkOut || "--:--";

    if(record.checkOut){
      document.getElementById("statusText").innerHTML = "Completed";
    }else{
      document.getElementById("statusText").innerHTML = "Working";
    }

  }else{

    document.getElementById("statusText").innerHTML = "Not Started";

  }

}


// =========================
// AUTO REFRESH WHEN RETURN FROM SCAN
// =========================
window.addEventListener("focus", () => {
  loadHome();
});

loadHome();
