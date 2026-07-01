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

return new Promise(resolve=>{

const img=new Image();

const canvas=document.createElement(
"canvas"
);

const reader=new FileReader();

reader.onload=e=>{

img.onload=()=>{

const max=600;

let width=img.width;

let height=img.height;

if(width>height){

if(width>max){

height*=max/width;
width=max;

}

}else{

if(height>max){

width*=max/height;
height=max;

}

}

canvas.width=width;
canvas.height=height;

const ctx=
canvas.getContext("2d");

ctx.drawImage(
img,
0,
0,
width,
height
);

resolve(

canvas
.toDataURL(
"image/jpeg",
0.7
)
.split(",")[1]

);

};

img.src=e.target.result;

};

reader.readAsDataURL(file);

});

}

// =====================
// UPLOAD PHOTO
// =====================
async function uploadPhoto(){

console.log("UPLOAD CLICKED");

const file = document.getElementById("photoInput").files[0];

if(!file){
alert("Please select photo");
return;
}

try{

const base64 = await compressImage(file);

console.log("COMPRESS DONE");

const user = JSON.parse(localStorage.getItem("user"));

const res = await apiPost({
action:"uploadPhoto",
employee_id:user.employee_id,
filename:file.name || "photo.jpg",
mime:"image/jpeg",
file:base64
});

console.log("UPLOAD RESPONSE:", res);

if(res.success){
document.getElementById("profilePhoto").src = res.photo;
alert("Photo Updated");
}else{
alert(res.message || "Upload Failed");
}

}catch(err){

console.log("UPLOAD ERROR:", err);
alert("Upload Error: " + err.message);

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
