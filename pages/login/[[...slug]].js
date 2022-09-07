import React, {useEffect, useState} from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Link from 'next/link';
import {useRouter} from "next/router"
import { fetchPaymentRequest } from "../../store/actions/adsActions";

function Login({
  fetchPaymentRequest,
  paymentReq,
  loading,
  cards,
  ...props
}) {
  const { register, formState: { errors }, handleSubmit } = useForm({criteriaMode: "all"});
  const {hasCards, setHasCards} = useState(false);

  const onSubmit = (data) => {
    console.log("login "+data);    
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

const mapDispatchToProps = {
  fetchPaymentRequest 
};
Login.propTypes = {
    loading: PropTypes.bool.isRequired
};
export default connect(mapStateToProps, mapDispatchToProps)(Login);
