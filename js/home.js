async function loadHome(){


const user =
JSON.parse(
localStorage.getItem("user")
);



if(!user){

return;

}



// 显示员工资料

document
.getElementById("employeeName")
.innerHTML =
user.employee_id;



document
.getElementById("branchName")
.innerHTML =
user.branch_id;





// 调用 GAS

const result =
await apiGet({

action:
"getDashboard",


branch:
user.branch_id


});





console.log(result);




if(result.success){



document
.getElementById("present")
.innerHTML =
result.data.present;



document
.getElementById("late")
.innerHTML =
result.data.late;



}


}



loadHome();
