async function apiPost(data){

const response =
await fetch(API_URL,{
method:"POST",

body:
JSON.stringify(data)

});


return await response.json();

}



async function apiGet(params){


const query =
new URLSearchParams(params);



const response =
await fetch(
API_URL+"?"+query
);


return await response.json();


}
