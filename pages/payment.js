import React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { adsSales } from "../store/actions/adsActions";
import PropTypes from "prop-types";

function CreditCardForm({
  salesResult,
  adsSales,
  ...props
}) {
  const { register, formState: { errors }, handleSubmit } = useForm({criteriaMode: "all"});
  
  const onSubmit = (data) => {
    console.log(data);
    adsSales().catch((error) => {
      alert("Failed to ADS Sales", error);
    });
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>TrendSetter Rewards</h1>
      <label htmlFor="ccnumber">Card Number * (E.G.: 9999 9999 9999 9995) </label>
      <input id="ccnumber"
        {...register("ccnumber", {
          required: "This credit card number is required.",
          pattern: {
            value: /\d+/,
            message: "This input is number only."
          },
          minLength: {
            value: 16,
            message: "This input must exceed 15 characters"
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
    <div>{salesResult}</div>
    </>
  );
}
function mapStateToProps(state, ownProps) {
  return {
    salesResult: state.sales,
  };
}
const mapDispatchToProps = {
  adsSales 
};
CreditCardForm.propTypes = {
  adsSales: PropTypes.func.isRequired,
};
export default connect(mapStateToProps, mapDispatchToProps)(CreditCardForm);
