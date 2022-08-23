import React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
//import { adsSales } from "../redux/actions/adsActions";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";


function Login({
  ...props
}) {
  const { register, formState: { errors }, handleSubmit } = useForm({criteriaMode: "all"});
  
  const onSubmit = (data) => {
    console.log("login "+data);
    
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>
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
      
      <Link to="/payment">Continue as guest</Link>
      <input type="submit" value="login"/>
    </form>
    
    </>
  );
}
function mapStateToProps(state, ownProps) {
  return {
    salesResult: state.sales,
  };
}
const mapDispatchToProps = {
  //adsSales 
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
