// =====================
// LOAD DATA
// =====================
async function loadUpdateProfile(){

const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user) return;

const res =
await apiGet({
action:"getProfile",
employee_id:
user.employee_id
});

if(!res.success)
return;

phone.value =
res.data.phone || "";

email.value =
res.data.email || "";

address.value =
res.data.address || "";

}

// =====================
// SAVE PROFILE
// =====================
async function saveProfile(){

const user =
JSON.parse(
localStorage.getItem("user")
);

const res =
await apiPost({

action:"updateProfile",

employee_id:
user.employee_id,

phone:
phone.value,

email:
email.value,

address:
address.value

});

alert(
res.message
);

if(res.success){

loadPage("profile");

}

}
