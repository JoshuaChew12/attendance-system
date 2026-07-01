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

const reader = new FileReader();

reader.onload=e=>{

const img = new Image();

img.onload=()=>{

const canvas = document.createElement("canvas");

const maxSize = 600;

let w = img.width;
let h = img.height;

if(w > h){
if(w > maxSize){
h *= maxSize / w;
w = maxSize;
}
}else{
if(h > maxSize){
w *= maxSize / h;
h = maxSize;
}
}

canvas.width = w;
canvas.height = h;

const ctx = canvas.getContext("2d");

ctx.drawImage(img,0,0,w,h);

const base64 = canvas.toDataURL("image/jpeg",0.7);

resolve(base64);

};

img.src = e.target.result;

};

reader.readAsDataURL(file);

});

}

// =====================
// UPLOAD PHOTO
// =====================
async function uploadPhoto(){

const file = document.getElementById("photoInput").files[0];

if(!file){
alert("Select photo");
return;
}

const user = JSON.parse(localStorage.getItem("user"));

// 🔥 compress first
const base64 = await compressImage(file);

// convert base64 → blob
const resBlob = await fetch(base64);
const blob = await resBlob.blob();

const formData = new FormData();
formData.append("action", "uploadPhoto");
formData.append("employee_id", user.employee_id);
formData.append("file", blob, "photo.jpg");

const response = await fetch(API_URL, {
method: "POST",
body: formData
});

const text = await response.text();

console.log("RAW:", text);

let res;

try{
res = JSON.parse(text);
}catch(e){
alert("Invalid JSON from server");
return;
}

console.log("PARSED:", res);

if(res.success){
document.getElementById("profilePhoto").src = res.photo;
alert("Photo Updated");
}else{
alert(res.message || "Upload failed");

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
