import { handleResponse, handleError } from "./apiUtils";
const baseUrl =  "https://imuat.saadiadirect.com/ftf/plcc/";
//const baseUrl =  "http://localhost:8080/plcc/";

export function sales3x(payload) {
  return fetch(baseUrl + "makesale" , {
    method:  "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(handleResponse)
    .catch(handleError);
}
export function paymentRequest(id) {
  return fetch(baseUrl + "request/" + id , {
    method:  "GET",
   // headers: { "content-type": "application/json" },
  })
    .then(handleResponse)
    .catch(handleError);
}

