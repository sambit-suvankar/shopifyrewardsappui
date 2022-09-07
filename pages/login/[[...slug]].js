import React, {useEffect, useState} from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Link from 'next/link';
import Multipassify from 'multipassify';
import {useRouter} from "next/router"
import { fetchPaymentRequest } from "../../store/actions/adsActions";

function Login({
  fetchPaymentRequest,
  paymentReq,
  loading,
  cards,
  ip,
  ...props
}) {
  const { register, formState: { errors }, handleSubmit } = useForm({criteriaMode: "all"});
  const {hasCards, setHasCards} = useState(false);

  const onSubmit = (data) => {
    console.log("login "+data);    
  }
  const getIPData = async () => {
    const res = await fetch('https://geolocation-db.com/json/');
    const json = await res.json();
    console.log(json);
  }
  const handleOnClick = () =>{
    console.log('Login wirh shopify '+paymentReq.customer.email,ip);

    // Construct the Multipassify encoder
    var multipassify = new Multipassify("b740a1d5ea31cb36cb7d7fc0e8291f5c");
    // Create your customer data hash
    var customerData = { email: paymentReq.customer.email, remote_ip:ip, return_to:"https://shopifyrewardsappui.vercel.app/payment"};

    // Encode a Multipass token
    var token = multipassify.encode(customerData);
    console.log('token',token)
    // Generate a Shopify multipass URL to your shop
    var url = multipassify.generateUrl(customerData, "dev1-lord-and-taylor.myshopify.com");
    window.location.href = url;
  }
  const { slug } = useRouter().query;
  const id = slug && slug.length > 0 && slug[0];
  useEffect (() => {
  console.log(id)
    if(id){
      fetchPaymentRequest(id);
    }
  },[id]);
  return (
   <>

    <h1>{loading?"Loading.....":""}</h1>
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Login{paymentReq&&paymentReq.id}</h1>
      <label htmlFor="emailId">Email</label>
      <input id="emailId" type={"email"} 
        {...register("emailId", {
          required: "This Email is required.",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Please enter valid email address"
          }
        })}
      />
       <ErrorMessage
        errors={errors}
        name="emailId"
        render={({ messages }) => {
          console.log("messages", messages);
          return messages
            ? Object.entries(messages).map(([type, message]) => (
                <p key={type}>{message}</p>
              ))
            : null;
        }}
      />
       <label htmlFor="password">Password</label>
      <input id="password" type="password"
        {...register("password", {
          required: "This password is required.",
          minLength: {
            value: 8,
            message: "Password must have at least 8 characters"
          }
        })}
      />
     
      <ErrorMessage
        errors={errors}
        name="password"
        render={({ messages }) => {
          console.log("messages", messages);
          return messages
            ? Object.entries(messages).map(([type, message]) => (
                <p key={type}>{message}</p>
              ))
            : null;
        }}
      />
      
      <Link href="/payment" >Continue as guest</Link>
      <input type="submit" value="login"/>
    </form>
    {
      paymentReq && 
      <div className="payment_details">
        <Link href={paymentReq.cancel_url} >Cancel and go back to store</Link>
        <button onClick={() => handleOnClick()}>Login with Shopify</button>
      </div>
    }
    
   </>

  );
}
function mapStateToProps(state, ownProps) {
  return {
    paymentReq: JSON.stringify(state.adsServices)!== '{}'  && state.adsServices.paymentReq,
    loading: state.apiCallsInProgress > 0 ? true: false
  };
}
/* Login.getInitialProps = async (ctx) =>{
  console.log('aa')
  const res = await fetch('http://localhost:8080/plcc/fetchcards?email=ftf_test.ftf@gmail.com',{method:'POST'})
  const json = await res.json();

  return {cards:json}
} */
export async function getServerSideProps({req}) {
  let ip;
  if (req.headers["x-forwarded-for"]) {
    ip = req.headers["x-forwarded-for"].split(',')[0]
  } else if (req.headers["x-real-ip"]) {
    ip = req.connection.remoteAddress
  } else {
    ip = req.connection.remoteAddress
  }
  return {
    props: {ip}, // will be passed to the page component as props
  }
}
const mapDispatchToProps = {
  fetchPaymentRequest 
};
Login.propTypes = {
    loading: PropTypes.bool.isRequired
};
export default connect(mapStateToProps, mapDispatchToProps)(Login);
