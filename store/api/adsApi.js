import { handleResponse, handleError } from "./apiUtils";
const baseUrl =  "https://imuat.saadiadirect.com/ftf/";
//const baseUrl =  "http://localhost:8080/plcc/";

export function sales3x(payload) {
  return fetch(baseUrl + "/plcc/finalize" , {
    method:  "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(handleResponse)
    .catch(handleError);
}
export function paymentRequest(id) {
  return fetch(baseUrl + "/plcc/request/'" + id +"'", {
    method:  "GET",
   // headers: { "content-type": "application/json" },
  })
    .then(handleResponse)
    .catch(handleError);
}

export function checkBalance(payload) {
  return fetch(baseUrl +"/api/svs/getBalance", {
    method:  "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(handleResponse)
    .catch(handleError);
}

