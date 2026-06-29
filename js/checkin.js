async function checkIn(){


const user =
JSON.parse(
localStorage.getItem("user")
);



const result =
await apiPost({

action:"checkIn",

employee_id:
user.employee_id,


branch_id:
user.branch_id


});



document
.getElementById("status")
.innerHTML =
result.message;


}

async function checkOut(){


const user =
JSON.parse(
localStorage.getItem("user")
);



const result =
await apiPost({

action:"checkOut",

employee_id:
user.employee_id


});



document
.getElementById("status")
.innerHTML =
result.message;


}
