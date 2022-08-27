import { handleResponse, handleError } from "./apiUtils";
import {rejectQuery,resolveQuery} from "../queries/queries";
import { GraphQLClient, gql } from "graphql-request";
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
export function paymentResolve(payload){
  let accesstoken = payload.accesstoken;
	let shop = payload.shop;
	let id = payload.id;
	let authorizationExpiresAt = payload.authorizationExpiresAt;
	const requestHeaders = {
		"X-Shopify-Access-Token": accesstoken,
	};
	const endpoint =
		"https://" +
		shop +
		"/payments_apps/api/" +
		"2022-04" +
		"/graphql.json";
	const client = new GraphQLClient(endpoint);
	const variables = { id: id };
  let result = {};
	try {
		const response = client.request(resolveQuery, variables, requestHeaders);
		console.log("Success ", JSON.stringify(response, undefined, 2));
		let result = JSON.parse(response);
    let errors = result.data.paymentSessionResolve.userErrors;
		if(errors.length == 0){
			let redirect_url = result.data.paymentSessionResolve.paymentSession.nextAction.context.redirectUrl;
			result = {"url":redirect_url} ;
		}else{
      result = {"errors":errors};
    }
		
	} catch (error) {
		console.error("Error ", JSON.stringify(error, undefined, 2));
    result = {"errors":"failed PaymentResolve"};
	}
  return result;
}
