import React, { useEffect, useState, useRef } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { adsSales } from "../store/actions/adsActions";
import PropTypes from "prop-types";
import { FaRegCreditCard } from "react-icons/fa";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import {ImCancelCircle} from 'react-icons/im'
import { store } from "../store/store";
import Link from "next/link";
import {addRcNumber, removeRcNumber} from '../store/actions/apiStatusActions';

function CreditCardForm({ adsSales, addRcNumber, removeRcNumber, paymentReq, makeSalesResponse,rcNumber, ...props }) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ criteriaMode: "all" });
  const {
    register : register2,
    formState: { errors : errors2 },
    handleSubmit : handleSubmit2,
    reset
  } = useForm({ criteriaMode: "all" });
  const { loading, setLoading } = useState(false);
  const  [collapsible, setCollapsible] = useState(false)
  const onSubmit = (data) => {
    console.log("onSubmit paymentReq", paymentReq);
    let cardNumber = data.ccnumber;
    let address1 = paymentReq && paymentReq.customer.billing_address.line1;
    let postalCode =
      paymentReq && paymentReq.customer.billing_address.postal_code;
    let amount = paymentReq && paymentReq.amount;
    let shop = paymentReq && paymentReq.cancel_url;
    let httpsLength = "https://".length;
    let lastIndex = shop.indexOf(".com") - 4;
    shop = shop.substr(httpsLength, lastIndex);

    const payload = {
      creditCardNumber: cardNumber,
      amount: amount,
      billingAddress: {
        address1: address1,
        postalCode: postalCode,
      },
      paymentId: shop,
    };
    adsSales(payload).catch((error) => {
      alert("Failed to ADS Sales", error);
    });
  };

  useEffect(() => {
    //console.log('paymentReq',paymentReq);
    let shop = paymentReq ? paymentReq.cancel_url : "";
    let httpsLength = "https://".length;
    let lastIndex = shop.indexOf(".com") - 4;
    shop = shop.substr(httpsLength, lastIndex);

    // console.log('makeSalesResponse',makeSalesResponse)
    if (makeSalesResponse && makeSalesResponse.accessToken) {
      let accessToken = makeSalesResponse.accessToken;
      let payload = {
        id: paymentReq.gid,
        shop: shop,
        accesstoken: accessToken,
      };
      if (makeSalesResponse.status === "success") {
        payload = {
          ...payload,
          type: "paymentresolve",
        };
      } else if (makeSalesResponse.status === "failed") {
        payload = {
          ...payload,
          type: "paymentreject",
          reason: {
            code: makeSalesResponse.code,
            merchantMessage: makeSalesResponse.errorMessage,
          },
        };
      }

      fetch("/api/" + payload.type, {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("Payment" + res.url);
          window.location.href = res.url;
        })
        .catch((err) => console.log("error in payment", err));
    }
  }, [paymentReq, makeSalesResponse]);

  const rewardCerf = useRef()
  const modalRef = useRef()

  const onClickReward = ()=> {
    rewardCerf.current.classList.toggle('hide-reward')
    setCollapsible(!collapsible)
  }
  const toggleModal = ()=> {
    modalRef.current.classList.toggle('hide-modal')
  }

  const onRcNumberSubmit = (data) => {
    console.log(data)
    const rcNumber = data.rcnumber;
    addRcNumber(rcNumber)
    reset()
  }

  const deleteRcNumber = (e) =>{
    console.log(e.target.id)
    removeRcNumber(e.target.id)
  }

  return (
    <>
      {paymentReq ? (
        <>
          <h1>Do Not Refresh The page </h1>
          <h1>TrendSetter Rewards</h1>
          <div className="payment_detais_container">
            <div className="card-details">
              <div className="reward-details-container">
                <label for="reward" className="reward" onClick={()=> onClickReward()}>
                  {collapsible ? <IoMdArrowDropdown style={{ height: "22px", width: "5%" }}/> : <IoMdArrowDropright style={{ height: "22px", width: "5%" }}/>}
                    
                    <span style={{color : "black", fontWeight: "bold"}}>PAY WITH A REWARD CERTIFICATE</span>  
                </label>

                <div className="reward-cards">
                  {rcNumber.length > 0 ? 
                  rcNumber.map(e => (<div className="rc-card" ><span>CERTIFICATE {e}</span> <button id={e} onClick={(e)=> deleteRcNumber(e) }>REMOVE</button></div>)) : 
                  <></>
                  }
                </div>
                
                <div className="rewards-certificate hide-reward" ref={rewardCerf}>
                    <form style={{ width: "100%", margin: "0"}} onSubmit={handleSubmit2(onRcNumberSubmit)}>
                      <div style={{display:"flex", justifyContent:"space-between"}}>
                        <div style={{width: "75%", marginRight: "10px"}}>
                          <label for="rcnumber">Reward Certificate Number</label>
                          <input type="number" id="rcnumber" {...register2("rcnumber",{minLength: {
                        value: 16,
                        message: "Card number must exceed 15 digits",
                      }})}></input>
                      
                        </div>
                        <div style={{width : "25%"}}>
                          <label for="rcnumber">PIN Number</label>
                          <input type="number" id="rcpin" {...register2("rcpin")}></input>
                        </div>
                      </div>
                      <div className="rewardButtons">
                        <button type="submit" value="Apply">APPLY</button>
                        <button type="button" onClick={()=> toggleModal()}>CHECK BALANCE</button>
                      </div>
                      
                      {/* <button type="button" onClick={()=> onClickReward()}>CANCEL</button> */}
                    </form>
                </div>
              </div>
              <div className="card_details_container">
                <label for="credit" className="credit">
                  <FaRegCreditCard
                    style={{ height: "22px", width: "5%" }}
                  ></FaRegCreditCard>
                  <a
                    style={{
                      marginLeft: "10px",
                      fontFamily: "sans-serif",
                      fontSize: "14px",
                      letterSpacing: "1px",
                    }}
                  >
                    TRENDSETTER
                    <span style={{ fontWeight: "bold", color: "red" }}>
                      {" "}
                      REWARDS{" "}
                    </span>
                    CARD
                  </a>
                </label>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <label htmlFor="ccnumber">
                    Card Number * (E.G.: 9999 9999 9999 9995){" "}
                  </label>
                  <input
                    id="ccnumber"
                    {...register("ccnumber", {
                      required: "The credit card number is required.",
                      pattern: {
                        value: /\d+/,
                        message: "This input is number only.",
                      },
                      minLength: {
                        value: 16,
                        message: "Card number must exceed 15 digits",
                      },
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

                  <input type="submit" value="pay" />
                </form>
              </div>
            </div>

            <div className="payment_details">
              Amount to be paid : {paymentReq && "$" + paymentReq.amount}
            </div>
          </div>
          Payment Successfull <Link href="">click here</Link> to complete order.
          <div className="error"></div>
        </>
      ) : (
        <p>Session timed out!!! Please go back to shopify </p>
      )}
      <div id="modal-window" className="modal-window hide-modal" ref={modalRef}>
        <div className="overlay" onClick={()=> toggleModal()}></div>
        <div className="modal">
          <ImCancelCircle className="cancelModal" onClick={()=> toggleModal()}/>
          <h1>HOW MUCH DO I HAVE LEFT?</h1>
          <h3>Enter your 19-digit New York and Company Rewards Certificate number and your 4-digit PIN below</h3>
          <div style={{marginTop: "50px"}}>
            <form>
              <label>Reward Certificate Number</label>
              <input></input>
              <label>PIN Number</label>
              <input></input>
              <button type="submit" style={{letterSpacing: "1px", cursor: "pointer", backgroundColor: "black"}}>Check My Balance</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function mapStateToProps(state, ownProps) {
  return {
    paymentReq: state.adsServices.paymentReq,
    makeSalesResponse: state.adsServices.makeSalesResponse,
    rcNumber : state.rewardReducer.rcNumber,

  };
}
const mapDispatchToProps = (dispatch) => ({
  adsSales,
  addRcNumber : (payload)=> dispatch(addRcNumber(payload)),
  removeRcNumber : (payload) => dispatch(removeRcNumber(payload))
});
CreditCardForm.propTypes = {
  adsSales: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreditCardForm);
