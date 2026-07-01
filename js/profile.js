let profileData={};

// =====================
// LOAD PROFILE
// =====================
async function loadProfile(){

const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

const res =
await apiGet({
action:"getProfile",
employee_id:user.employee_id
});

if(!res.success) return;

profileData=res.data;

const map={

name:profileData.name,
employeeID:profileData.employee_id,
mykad:profileData.mykad,
gender:profileData.gender,
phone:profileData.phone,
email:profileData.email,
address:profileData.address,
position:profileData.position,
department:profileData.department,
branch:profileData.branch_name,
joinDate:profileData.join_date,
role:profileData.role

};

for(let id in map){

document.getElementById(id)
.innerHTML =
map[id] || "-";

}

if(profileData.photo){

profilePhoto.src=
profileData.photo;

}

}

// =====================
// COMPRESS IMAGE
// =====================
function compressImage(file){

return new Promise((resolve,reject)=>{

const reader = new FileReader();

reader.onload = function(e){

const img = new Image();

img.onload = function(){

const canvas =
document.createElement("canvas");

const maxSize = 600;

let width = img.width;
let height = img.height;

// =====================
// Resize
// =====================
if(width > height){

if(width > maxSize){
height =
height * maxSize / width;
width = maxSize;
}

}else{

if(height > maxSize){
width =
width * maxSize / height;
height = maxSize;
}

}
// =====================
// Canvas
// =====================
canvas.width = width;
canvas.height = height;

const ctx =
canvas.getContext("2d");

ctx.drawImage(
img,
0,
0,
width,
height
);

// =====================
// Compress JPEG
// =====================
const base64 =
canvas.toDataURL(
"image/jpeg",
0.75
);

resolve(base64);

};

img.onerror = reject;
img.src = e.target.result;

};

reader.onerror = reject;
reader.readAsDataURL(file);

});

}

// =====================
// UPLOAD PHOTO
// =====================
async function uploadPhoto(){

const file =
document.getElementById("photoInput").files[0];

if(!file){
alert("Select photo");
return;
}

const user =
JSON.parse(
localStorage.getItem("user")
);

// compress
const base64 =
await compressImage(file);

console.log(base64.substring(0,50));

const res =
await apiPost({
action:"uploadPhoto",
employee_id:
user.employee_id,
file:
base64
});

console.log(res);

if(res.success){

document.getElementById(
"profilePhoto"
).src =
res.photo;

alert(
"Photo Updated"
);

}else{

alert(
res.message
);

}

}

// =====================
// LOGOUT
// =====================
function logout(){

localStorage.clear();

window.location.href=
"index.html";

}
