let scannedBranch = "";

function qrSuccess(decodedText){


scannedBranch =
decodedText;



document
.getElementById("status")
.innerHTML =
"Branch: "+decodedText;


}


function getLocation(){


return new Promise(
(resolve,reject)=>{


if(!navigator.geolocation){


reject(
new Error("GPS not supported")
);


return;


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
new Error(
"GPS permission denied"
)
);


}

);



});


}


async function checkIn(){


try{


const user =
JSON.parse(
localStorage.getItem("user")
);



if(!scannedBranch){


throw new Error(
"Please scan QR Code first"
);


}



const position =
await getLocation();



const result =
await apiPost({

action:"checkIn",

employee_id:
user.employee_id,


branch_id:
scannedBranch,


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



function backDashboard(){

window.location.href=
"dashboard.html";

}
