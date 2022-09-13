import React, { useEffect, useState, useRef, useCallback } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import {useRouter} from "next/router"
import { connect } from "react-redux";
import { adsSales } from "../../store/actions/adsActions";
import PropTypes from "prop-types";
import { FaRegCreditCard } from "react-icons/fa";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import {ImCancelCircle} from 'react-icons/im'
import { store } from "../../store/store";
import Link from "next/link";
import {addRcNumber, removeRcNumber} from '../../store/actions/apiStatusActions';
import { fetchPaymentRequest } from '../../store/actions/adsActions';
import * as adsApi from '../../store/api/adsApi';
import Loader from "../loader";

function CreditCardForm({ adsSales, addRcNumber, removeRcNumber, paymentReq, makeSalesResponse, rcNumber, fetchPaymentRequest, ...props }) {
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
  const [ loading, setLoading ] = useState(true);
  const [ modalLoading, setModalLoading ] = useState(false);
  const [ collapsible, setCollapsible] = useState(false);
  const [ paymentData, setPaymentData] = useState({})
  let shop
  let httpsLength
  let lastIndex

  const { slug } = useRouter().query;
  const id = slug && slug.length > 0 && slug[0];

  const onSubmit = (data) => {
    console.log("onSubmit paymentReq", paymentData);
    let cardNumber = data.ccnumber;
    let address1 = paymentData && paymentData.customer.billing_address.line1;
    let postalCode =
      paymentData && paymentData.customer.billing_address.postal_code;
    let amount = paymentData && paymentData.amount;
    shop = paymentData && paymentData.cancel_url;
    httpsLength = "https://".length;
    lastIndex = shop.indexOf(".com") - 4;
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


  useEffect(()=>{
    if(id){
      adsApi.paymentRequest(id)
      .then((paymentReq) => {
        setPaymentData((data) => {
          data = paymentReq;
          console.log(data);
          return data
        })
        setLoading(false);
      })
    }
  },[id])

  useEffect(() => {
      
       console.log('makeSalesResponse',makeSalesResponse)
      if (makeSalesResponse && makeSalesResponse.accessToken) {
        let accessToken = makeSalesResponse.accessToken;
        shop = paymentData ? paymentData.cancel_url : "";
        httpsLength = "https://".length;
        lastIndex = shop?shop.indexOf(".com") - 4 : null;
        shop = shop?shop.substr(httpsLength, lastIndex) : "";
        let payload = {
          id: paymentData.gid,
          shop: shop,
          accesstoken: accessToken,
        };
        if (makeSalesResponse.status === "success") {
          payload = {
            ...payload,
            type: "paymentresolve",
          };
          fetch("/api/" + payload.type, {
            method: "POST", // POST for create, PUT to update when id already exists.
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then((res) => {
              console.log("Payment Resolved" + res.url);
              window.location.href = res.url;
            })
            .catch((err) => console.log("error in payment", err));
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
      } 
  }, [makeSalesResponse]);

  const rewardCerf = useRef()
  const modalRef = useRef()

  const onClickReward = ()=> {
    rewardCerf.current.classList.toggle('hide-reward')
    setCollapsible(!collapsible)
  }
  const toggleModal = ()=> {
    setModalLoading(true)
    setTimeout(() => {
      setModalLoading(false)
      modalRef.current.classList.toggle('hide-modal')
    }, 2000);
  }

  const closeModal = () => {
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
      {loading ?  (
        <Loader/>
      ) : (
        <>
          <h1>TrendSetter Rewards</h1>
          <div className="payment_detais_container">
            <div className="card-details">
              <div className="reward-details-container">
                <label htmlFor="reward" className="reward" onClick={()=> onClickReward()}>
                  {collapsible ? <IoMdArrowDropdown style={{ height: "25px", width: "10%" }}/> : <IoMdArrowDropright style={{ height: "25px", width: "10%" }}/>}
                    
                    <span style={{color : "black", fontWeight: "bold"}}>PAY WITH A REWARD CERTIFICATE</span>  
                </label>

                <div className="reward-cards">
                  {rcNumber.length > 0 ? 
                  rcNumber.map((e,i) => (<div className="rc-card" key={i}><span>CERTIFICATE {e}</span> <button id={e} onClick={(e)=> deleteRcNumber(e) }>REMOVE</button></div>)) : 
                  <></>
                  }
                </div>
                
                <div className="rewards-certificate hide-reward" ref={rewardCerf}>
                    <form style={{ width: "100%", margin: "0"}} onSubmit={handleSubmit2(onRcNumberSubmit)}>
                      <div style={{display:"flex", justifyContent:"space-between"}}>
                        <div style={{width: "75%", marginRight: "10px"}}>
                          <label htmlFor="rcnumber">Reward Certificate Number</label>
                          <input id="rcnumber" {...register2("rcnumber",{minLength: {
                        value: 16,
                        message: "Card number must exceed 15 digits",
                      }})}></input>
                      
                        </div>
                        <div style={{width : "25%"}}>
                          <label htmlFor="rcnumber">PIN Number</label>
                          <input id="rcpin" {...register2("rcpin",{minLength: {
                        value: 4,
                        message: "PIN must be of 4 digits",
                      }})}></input>
                        </div>
                      </div>
                      <div className="rewardButtons">
                        <button type="submit" value="Apply">APPLY</button>
                        <button type="button" onClick={()=> toggleModal()}>CHECK BALANCE</button>
                      </div>
                      <span>$5.99 successfully applied to order. Your card will have $494.01 balance remaining after this transaction is completed.</span>
                      {/* <button type="button" onClick={()=> onClickReward()}>CANCEL</button> */}
                    </form>
                </div>
              </div>
              <div className="card_details_container">
                <label htmlFor="credit" className="credit">
                  <FaRegCreditCard
                    style={{ height: "22px", width: "10%" }}
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
                  {makeSalesResponse?.errorMessage ? <></> :
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
                  /> }
                  {makeSalesResponse?.errorMessage ? <p>Your provided card information is not correct.</p> : <></>}

                  <input type="submit" value="pay" />
                </form>
              </div>
            </div>

            <div className="payment_details">
              <h4>Payment Summary</h4>
              <span className="payment_span">Amount to be paid : <span>{paymentData && "$" + paymentData.amount}</span></span>
              <span className="payment_span">Amount paid by reward certificate : <span>{paymentData && "$" + paymentData.amount}</span></span>
              <span className="payment_span">Cost to credit card : <span>{paymentData && "$" + paymentData.amount}</span></span>
              
            </div>
          </div>
          <div style={{textAlign: "center", marginBottom: "40px"}}> <Link href={paymentData.cancel_url}>Cancel and go back to store</Link></div>
          <div className="error"></div>
        </>
      ) }
      <div id="modal-window" className="modal-window hide-modal" ref={modalRef}>
        <div className="overlay" onClick={()=> closeModal()}></div>
        <div className="modal">
          <ImCancelCircle className="cancelModal" onClick={()=> closeModal()}/>
          <h1>HOW MUCH DO I HAVE LEFT?</h1>
          <h3>Enter your 19-digit New York and Company Rewards Certificate number and your 4-digit PIN below</h3>
          <div className="modal_form" style={{marginTop: "50px"}}>
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
      {modalLoading ? <Loader/> : <></>}
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
  adsSales : (payload) => dispatch(adsSales(payload)),
  fetchPaymentRequest : (id) => dispatch(fetchPaymentRequest(id)),
  addRcNumber : (payload)=> dispatch(addRcNumber(payload)),
  removeRcNumber : (payload) => dispatch(removeRcNumber(payload))
});
CreditCardForm.propTypes = {
  adsSales: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreditCardForm);
