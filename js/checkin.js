async function checkIn(){


try{


const user =
JSON.parse(
localStorage.getItem("user")
);



const position =
await getLocation();



const result =
await apiPost({

action:"checkIn",

employee_id:
user.employee_id,


branch_id:
user.branch_id,


lat:
position.lat,


lng:
position.lng


});



document
.getElementById("status")
.innerHTML =
result.message;



}catch(error){


document
.getElementById("status")
.innerHTML =
error.message;


}



}




async function checkOut(){


try{


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



}catch(error){


document
.getElementById("status")
.innerHTML =
error.message;


}


}




function getLocation(){


return new Promise(
(resolve,reject)=>{


if(!navigator.geolocation){


reject(
"GPS not supported"
);


}



navigator.geolocation.getCurrentPosition(

(position)=>{


resolve({

lat:
position.coords.latitude,

lng:
position.coords.longitude


});


},


(error)=>{


reject(
"GPS permission denied"
);


}

);



});


}




function backDashboard(){

window.location.href=
"dashboard.html";

}
