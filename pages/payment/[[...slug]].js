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
import RewardCardDetails from "../rewardCardDetails";

function CreditCardForm({ adsSales, addRcNumber, removeRcNumber, paymentReq, makeSalesResponse, rcDetails, fetchPaymentRequest, ...props }) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ criteriaMode: "all" });
  const {
    register : register2,
    formState: { errors : errors2 },
    handleSubmit : handleSubmit2,
    // reset
  } = useForm({ criteriaMode: "all" });
  const [ loading, setLoading ] = useState(true);
  const [ modalLoading, setModalLoading ] = useState(false);
  const [ collapsible, setCollapsible] = useState(false);
  const [ paymentData, setPaymentData] = useState({})
  const [ amountPaidByRC, setAmountPaidByRC ] = useState(0)
  const [ costToCredit, setCostToCredit ] = useState(0);
  const [ loadingSubmit, setLoadingSubmit ]= useState(false)
  let shop
  let httpsLength
  let lastIndex

  const { slug } = useRouter().query;
  const id = slug && slug.length > 0 && slug[0];

  const onSubmit = (data) => {
    console.log("onSubmit paymentReq", paymentData);
    let cardNumber = data.ccnumber;
    let address1 = paymentData && paymentData.json.customer.billing_address.line1;
    let postalCode =
      paymentData && paymentData.json.customer.billing_address.postal_code;
    let amount = paymentData && paymentData.json.amount;
    shop = paymentData && paymentData.json.cancel_url;
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
        setPaymentData((data) => {  // Here we have set the paymentdata by fetching the API
          data.json = JSON.parse(paymentReq.json);
          data.status = paymentReq.status
          console.log(data);
          return data
        })
        if(amountPaidByRC === 0){    // Amount to be paid = cost to credit if no reward card is applied
          setCostToCredit((data)=> data = parseFloat(JSON.parse(paymentReq.json).amount))
        }
        setLoading(false);
      }) 
    } 
  },[id])

  useEffect(() => {
      
       console.log('makeSalesResponse',makeSalesResponse)
      if (makeSalesResponse && makeSalesResponse.accessToken) {
        let accessToken = makeSalesResponse.accessToken;
        shop = paymentData ? paymentData.json.cancel_url : "";
        httpsLength = "https://".length;
        lastIndex = shop?shop.indexOf(".com") - 4 : null;
        shop = shop?shop.substr(httpsLength, lastIndex) : "";
        let payload = {
          id: paymentData.json.gid,
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
            code: makeSalesResponse.code,
            merchantMessage: makeSalesResponse.errorMessage
          };
        }    
      } 
  }, [makeSalesResponse]);

  const modalRef = useRef()

 
  // Function to toggle the Check balance Modal
  const toggleModal = ()=> {
    setModalLoading(true)
    setTimeout(() => {
      setModalLoading(false)
      modalRef.current.classList.toggle('hide-modal')
    }, 2000);
  }

  // Function to close the check balance modal
  const closeModal = () => {
    modalRef.current.classList.toggle('hide-modal')
  }

  // This Function is called at the time of applying Reward card 
  const onRcNumberSubmit = async(data) => {
    console.log(data)
    if(!data.rcnumber || !data.rcpin){
      return
    }
    setLoadingSubmit(true)
    const rcNumber = data.rcnumber;
    const rcPin = data.rcpin
    const result = await fetch("http://localhost:3000/api/getrcbalance1")
    let balanceData = await result.json()
    
    if(costToCredit < balanceData.balance && costToCredit !== 0){
      balanceData.balance = parseFloat(costToCredit)
      addRcNumber({rcNumber, rcPin, amountPaidByRC : balanceData.balance});
    }else if(costToCredit > balanceData.balance && costToCredit !== 0){
      addRcNumber({rcNumber, rcPin, amountPaidByRC : balanceData.balance})
    }

    setLoadingSubmit(false)
  }

  //Each time Reward card details getting saved inside the store our cost to credit card amount will get calculated
  useEffect(()=>{
    let totalAmount = rcDetails.reduce((acc, obj) => acc + obj.amountPaidByRC, 0)
    setAmountPaidByRC(totalAmount)
    setCostToCredit(paymentData.json && parseFloat((paymentData.json.amount - totalAmount).toFixed(2)))
  },[rcDetails])



  return (
    <>
      {loading ?  (
        <Loader/>
      ) : (
        <>
          <h1>TrendSetter Rewards</h1>
          <div className="payment_detais_container">
            <div className="card-details">
              <RewardCardDetails
              register2={register2}
              error2={errors2}
              handleSubmit2={handleSubmit2}
              onRcNumberSubmit={(data)=> onRcNumberSubmit(data)}
              toggleModal={() => toggleModal()}
              loadingSubmit={loadingSubmit}
              setLoadingSubmit={(v) => setLoadingSubmit(v)}
              // reset={()=> reset()}
              />
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

                <form id="ccForm" onSubmit={handleSubmit(onSubmit)}>
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

                  
                </form>
              </div>
              {paymentData.status == "inprogress" ? <input form="ccForm" type="submit" value="pay" /> : <>  </>}
              {paymentData.status && paymentData.status !== "inprogress" ? <div className="overlay-modal-container">
                  <div className="overlay-modal">
                    <div className="overlay-modal-text-content"> <p>Your payment has been done already</p></div>
                  </div>
                </div> : <></>
              }
            </div>

            <div className="payment_details">
              <h4>Payment Summary</h4>
              <span className="payment_span">Amount to be paid : <span>{paymentData && "$" + paymentData.json.amount}</span></span>
              <span className="payment_span">Amount paid by reward certificate : <span>{"$" + amountPaidByRC}</span></span>
              <span className="payment_span">Cost to credit card : <span>{"$" + costToCredit}</span></span>
              
            </div>
          </div>
          <div className="backToStore" style={{textAlign: "center", marginBottom: "40px"}}> <Link href={paymentData.json ? paymentData.json.cancel_url : '/'}>Cancel and go back to store</Link></div>
          <div className="error"></div>
          <div className="footer">
            <div></div>
            <div><h3>&copy; POWERED BY SAADIA GROUP</h3></div>
            <div><a href="https://c.comenity.net/ac/fashiontofigure/public/home" target="_blank" rel="noopener noreferrer">PAY BILLS</a></div>
          </div>
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
    rcDetails : state.rewardReducer.rcDetails,

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
