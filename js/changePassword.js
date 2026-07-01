async function savePassword(){

if(
newPassword.value !=
confirmPassword.value
){

alert(
"Password not match"
);

return;

}

const user =
JSON.parse(
localStorage.getItem("user")
);

const res =
await apiPost({
action:"changePassword",
employee_id:
user.employee_id,
oldPassword:
oldPassword.value,
newPassword:
newPassword.value
});

alert(
res.message
);

if(res.success){

logout();

}


}
