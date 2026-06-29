async function loadDashboard(){


const user =
JSON.parse(
localStorage.getItem("user")
);



const result =
await apiGet({

action:
"getDashboard",

branch:
user.branch_id

});



document
.getElementById("present")
.innerHTML =
result.data.present;



document
.getElementById("late")
.innerHTML =
result.data.late;


}



loadDashboard();
