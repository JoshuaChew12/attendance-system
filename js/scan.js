let scannedBranch="";



// QR 成功

function qrSuccess(decodedText){


scannedBranch =
decodedText;



document
.getElementById("scanStatus")
.innerHTML =
"Branch : "+decodedText;



}




// QR Scanner


function startScanner(){



const scanner =
new Html5QrcodeScanner(

"reader",

{

fps:10,

qrbox:250

}


);



scanner.render(
qrSuccess
);



}



startScanner();





// GPS


function getLocation(){


return new Promise(
(resolve,reject)=>{


if(!navigator.geolocation){


reject(
"GPS not supported"
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
"GPS Permission Denied"
);


}


);


});


}





// CHECK IN


async function checkIn(){


try{


const user =
JSON.parse(
localStorage.getItem("user")
);



if(!scannedBranch){


throw new Error(
"Please scan QR first"
);


}





const gps =
await getLocation();





const result =
await apiPost({


action:"checkIn",


employee_id:
user.employee_id,


branch_id:
scannedBranch,


lat:
gps.lat,


lng:
gps.lng


});




document
.getElementById("scanStatus")
.innerHTML =
result.message;




}

catch(error){


document
.getElementById("scanStatus")
.innerHTML =
error;


}


}







// CHECK OUT


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
.getElementById("scanStatus")
.innerHTML =
result.message;


}
