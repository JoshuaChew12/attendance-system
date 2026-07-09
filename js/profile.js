window.profileData=window.profileData||{};

async function loadProfile(){

const res=await apiGet({action:"getProfile"});
if(!res.success)return;
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
// 修改这里
branch:
profileData.working_branch_name||
profileData.default_branch_name||
"-",
joinDate:profileData.join_date,
role:profileData.role

};

Object.keys(map).forEach(id=>{
const el=document.getElementById(id);
if(el)
el.innerHTML=map[id]||"-";

});

const img=document.getElementById("profilePhoto");
if(img&&profileData.photo){
img.src=profileData.photo+"?t="+Date.now();
}

}

async function uploadPhoto(){
const file=document.getElementById("photoInput").files[0];
if(!file) return alert("Select photo");

const user=JSON.parse(localStorage.getItem("user"));

const base64=await new Promise((res,rej)=>{
const r=new FileReader();
r.onload=e=>{
const img=new Image();
img.onload=()=>{
const c=document.createElement("canvas");
let w=img.width,h=img.height,mx=600;
if(w>h){if(w>mx){h=h*mx/w;w=mx;} }
else{if(h>mx){w=w*mx/h;h=mx;} }
c.width=w;c.height=h;
c.getContext("2d").drawImage(img,0,0,w,h);
res(c.toDataURL("image/jpeg",0.75));
};
img.src=e.target.result;
};
r.readAsDataURL(file);
});

const res=await apiPost({
action:"uploadPhoto",
employee_id:user.employee_id,
file:base64
});

if(res.success){
const img=document.getElementById("profilePhoto");
if(img) img.src=res.photo;
alert("Photo Updated");
}else alert(res.message);
}

async function logout(){
try{await apiPost({action:"logout"});}catch(e){}
localStorage.clear();
window.location.href="index.html";
}
