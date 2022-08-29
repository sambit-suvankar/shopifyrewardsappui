import React,{useEffect, useState} from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { adsSales } from "../store/actions/adsActions";
import PropTypes from "prop-types";
import { store } from "../store/store";
import Link from "next/link";

function CreditCardForm({
  adsSales,
  paymentReq,
  makeSalesResponse,
  ...props
}) {
  const { register, formState: { errors }, handleSubmit } = useForm({criteriaMode: "all"});
  const {loading, setLoading} = useState(false);
  const onSubmit = (data) => {
    console.log('onSubmit paymentReq',paymentReq)
    let cardNumber = data.ccnumber;
    let address1 = paymentReq && paymentReq.customer.billing_address.line1;
    let postalCode = paymentReq && paymentReq.customer.billing_address.postal_code;
    let amount = paymentReq && paymentReq.amount;
    let shop = paymentReq && paymentReq.cancel_url;
    let httpsLength = "https://".length;
    let lastIndex = shop.indexOf('.com')-4;
    shop = shop.substr(httpsLength,lastIndex);

    const payload = {
      "creditCardNumber": cardNumber,
      "amount": amount,
      "billingAddress":{
        "address1": address1,
        "postalCode": postalCode
      },
      "paymentId":shop
    };
    adsSales(payload).catch((error) => {
      alert("Failed to ADS Sales", error);
    });
  }
  
  useEffect(()=>{
    console.log('paymentReq',paymentReq);
    let shop = paymentReq ? paymentReq.cancel_url:"";
    let httpsLength = "https://".length;
    let lastIndex = shop.indexOf('.com')-4;
    shop = shop.substr(httpsLength,lastIndex);  
  
    console.log('makeSalesResponse',makeSalesResponse)
    if(makeSalesResponse && makeSalesResponse.accessToken){
      let accessToken = makeSalesResponse.accessToken;
      let payload = {
        id:paymentReq.gid,
        shop:shop,
        accesstoken:accessToken
      }
      if(makeSalesResponse.status === 'success'){
        payload = {
          ...payload,
          type:"paymentresolve"
        }
      }else if(makeSalesResponse.status === 'failed'){
        payload = {
          ...payload,
          type:"paymentreject",
          reason: {
            code: makeSalesResponse.code,
            merchantMessage: makeSalesResponse.errorMessage
          }
        }
      }
      console.log(payload.type)
      fetch('/api/'+payload.type,{
        method:  "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then((res) => res.json())
      .then((res) => {
        console.log("Payment"+payload.type+ JSON.stringify(res));
        /*window.location.href = res.url;*/
      }).catch(err=>console.log('error in payment',err));
    }
      
  },[paymentReq,makeSalesResponse]);
 
  return (
    <>
    { paymentReq? <>
    <h1>Do Not Refresh The page </h1>
    <h1>TrendSetter Rewards</h1>
    
    <div className="payment_details">
      Amount to be paid : {paymentReq && '$'+ paymentReq.amount}
    </div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="ccnumber">Card Number * (E.G.: 9999 9999 9999 9995) </label>
      <input id="ccnumber"
        {...register("ccnumber", {
          required: "The credit card number is required.",
          pattern: {
            value: /\d+/,
            message: "This input is number only."
          },
          minLength: {
            value: 16,
            message: "Card number must exceed 15 digits"
          }
        })}
      />
      <ErrorMessage
        errors={errors}
        name="ccnumber"
        render={({ messages }) => {
          console.log("messages", messages);
          return messages
            ? Object.entries(messages).map(([type, message]) => (
                <p key={type}>{message}</p>
              ))
            : null;
        }}
      />

      <input type="submit" value="pay"/>
    </form>
    Payment Successfull <Link href="">click here</Link> to complete order.
    <div className="error"></div></>
    : <p>Session timed out!!! Please go back to shopify </p>}
    </>
  );
}
function mapStateToProps(state, ownProps) {
  return {
    paymentReq : state.adsServices.paymentReq,
    makeSalesResponse:state.adsServices.makeSalesResponse
  };
}
const mapDispatchToProps = {
  adsSales
};
CreditCardForm.propTypes = {
  adsSales: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreditCardForm);
