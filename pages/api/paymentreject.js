// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {rejectQuery,resolveQuery} from "../../store/queries/queries"
import { GraphQLClient } from "graphql-request";
import { ApiVersion } from "@shopify/shopify-api";

export default async function(req,res){
  let accesstoken = req.body.accesstoken;
  let shop = req.body.shop;
  let id = req.body.id;
  const requestHeaders = {
    "X-Shopify-Access-Token": accesstoken,
  };
  const endpoint =
   "https://" +
   shop +
   "/payments_apps/api/" +
    ApiVersion.April22 +
    "/graphql.json";
  const client = new GraphQLClient(endpoint);
  const variables = { id: id , reason:req.body.reason};
  let result = {};
  try {
    const response = await client.request(rejectQuery, variables, requestHeaders);
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
  res.status(200).json(result)
}

