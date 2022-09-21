import React, { useEffect, useState, useRef, useCallback } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import {useRouter} from "next/router"
import { connect } from "react-redux";
import { adsSales, checkBalance } from "../../store/actions/adsActions";
import PropTypes from "prop-types";
import { FaRegCreditCard } from "react-icons/fa";
// import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
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
    reset
  } = useForm({ criteriaMode: "all" });
  const [ loading, setLoading ] = useState(true);
  const [ modalLoading, setModalLoading ] = useState(false); // state of loader for modal component loading
  const [ paymentData, setPaymentData] = useState({})   // state for the fetched data at the time of page mounting
  const [ amountPaidByRC, setAmountPaidByRC ] = useState(0)
  const [ costToCredit, setCostToCredit ] = useState(0);  
  const [ loadingSubmit, setLoadingSubmit ]= useState(false)  // For spinner state
  const [ rcCard, setRcCard ] = useState({visible : true})  // State for RC card details used in Check balance modal and warning message
  const [ appliedMsg, setAppliedMsg ] = useState(false) //State for warning message visibility of RC card section
  let shop
  let httpsLength
  let lastIndex

  const { slug } = useRouter().query;
  const id = slug && slug.length > 0 && slug[0];

  const onSubmit = (data) => {
    console.log("onSubmit paymentReq", paymentData);
    setLoading(true);
    let cardNumber = data.ccnumber;
    let paymentjson = paymentData && paymentData.json;
    let address1 = paymentjson.customer.billing_address.line1;
    let postalCode =
    paymentjson.customer.billing_address.postal_code;
    let amount = paymentjson.amount;
    let adsAmount = costToCredit;
    let paymentId = paymentjson.id;
    let cancelURL = paymentjson.cancel_url;
    const payload = {
      "paymentId":paymentId,
      "cancel_url":cancelURL,
      "creditCardInfo":{
        creditCardNumber: cardNumber,
        amount:adsAmount,
        billingAddress: {
          address1: address1,
          postalCode: postalCode,
        },
      },
      "RewardCertificates":rcDetails,
      amount: amount,
    };
    console.log(payload)
    adsSales(payload).catch((error) => {
      alert("Failed to ADS Sales", error);
    });
    setLoading(false);
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
      if (makeSalesResponse) {
           if(makeSalesResponse.redirect_url){
             window.location.href = makeSalesResponse.redirect_url;
           }else{

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

  // Function to close the check balance modal and wipe balance data from the state
  const closeModal = () => {
    modalRef.current.classList.toggle('hide-modal')
    setRcCard({...rcCard,visible : true, modalErrorMsg : ""})
    reset()
  }
  // Funtion to check balance again while staying in the same modal
  const checkBalanceAgain = () => {
    setRcCard({...rcCard, visible : true, modalErrorMsg : ""})
    reset()
  }

  // This Function is called at the time of applying Reward card 
  const onRcNumberSubmit = async(data) => {
    console.log(data)
    
    if(!data.rcnumber || !data.rcpin){  // Condition for empty rc number or Pin to set the error messagex`
      setRcCard({...rcCard, errorMsg : "Sorry, reward certificate number & PIN is required."})
      return
    }
    setAppliedMsg(false)
    setLoadingSubmit(true)
    const cardNumber = data.rcnumber;
    const pinNumber = data.rcpin;
    const result = adsApi.checkBalance({cardNumber,pinNumber}).catch(error=>{return error});
    let balanceData = await result;
    console.log(balanceData)

    if(!balanceData.balance){   // Condition for invalid RC Card or PIN to set the error mesage
      setLoadingSubmit(false);
      setRcCard({...rcCard, errorMsg : "Uh-oh! Your reward certificate number or pin number seem to be invalid."})
      return
    }

    setRcCard({...rcCard,errorMsg : '', balance : balanceData.balance})

    if(balanceData.balance){
      if(costToCredit < balanceData.balance && costToCredit !== 0){
        balanceData.balance = parseFloat(costToCredit)
        addRcNumber({cardNumber, pinNumber, amountPaidByRC : balanceData.balance});
      }else if(costToCredit > balanceData.balance && costToCredit !== 0){
        addRcNumber({cardNumber, pinNumber, amountPaidByRC : balanceData.balance})
      }
    }
    setAppliedMsg(true)
    setLoadingSubmit(false);
    
  }

  //Each time Reward card details getting saved inside the store our cost to credit card amount will get calculated
  useEffect(()=>{
    let totalAmount = rcDetails.reduce((acc, obj) => acc + obj.amountPaidByRC, 0)
    setAmountPaidByRC(totalAmount)
    setCostToCredit(paymentData.json && parseFloat((paymentData.json.amount - totalAmount).toFixed(2)))
    if(rcDetails.length == 0){
      setAppliedMsg(false)
    }
  },[rcDetails])


  const checkRcBalance = async(data) => {
    if(!data.rc_num || !data.rc_pin){  // Condition for empty rc number or Pin to set the error messagex`
      setRcCard({...rcCard, modalErrorMsg : "Sorry, reward certificate number & PIN is required."})
      return
    }
    setLoadingSubmit(true)
    const cardNumber = data.rc_num;
    const pinNumber = data.rc_pin;
    const result = adsApi.checkBalance({cardNumber,pinNumber}).catch(error=>{return error});
    let balanceData = await result;
    console.log(balanceData.balance)
    if(!balanceData.balance){   // Condition for invalid RC Card or PIN to set the error mesage
      setLoadingSubmit(false);
      setRcCard({...rcCard, modalErrorMsg : "Uh-oh! Your reward certificate number or pin number seem to be invalid."})
      return
    }
    setRcCard({cardNumber, balance : balanceData.balance, visible : false, modalErrorMsg : ""})
    reset()
    setLoadingSubmit(false)
  }
  const ccValidation =  (parseFloat(costToCredit) > 0) ? "The credit card number is required." : false

 

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
                onRcNumberSubmit={(data)=> onRcNumberSubmit(data)}
                toggleModal={() => toggleModal()}
                loadingSubmit={loadingSubmit}
                setLoadingSubmit={(v) => setLoadingSubmit(v)}
                rcCard={rcCard}
                appliedMsg={appliedMsg}
                costToCredit={costToCredit}
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
                      required: ccValidation,
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
                  {makeSalesResponse?.errors ? <></> :
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
                  {makeSalesResponse?.errors ? <p>Your provided card information is not correct.</p> : <></>}

                  
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
          {rcCard.visible ? 
          <>
          <h3>Enter your 19-digit New York and Company Rewards Certificate number and your 4-digit PIN below</h3>
          <div className="modal_form">
            {rcCard.modalErrorMsg ? <span style={{color : 'red'}}>{rcCard.modalErrorMsg}</span> : <></>}
            <form onSubmit={handleSubmit2(checkRcBalance)}>
              <label>Reward Certificate Number</label>
              <input maxLength="19" type="number" {...register2("rc_num",{minLength: {
                        value: 19,
                        message: "Card number must be of 19 digits",
                      },maxLength : {
                        value : 19,
                        message: "Card number must be of 19 digits"
                      },
                      })}>
              </input>
              <ErrorMessage
                        errors={errors2}
                        name="rc_num"
                        render={({ messages }) => {
                        console.log("messages", messages);
                        return messages
                            ? Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                            ))
                            : null;
                        }}
                    />
              <label>PIN Number</label>
              <input maxLength="4" type="number" {...register2("rc_pin",{minLength: {
                        value: 4,
                        message: "PIN must be of 4 digits",
                      },maxLength : {
                        value : 4,
                        message: "PIN must be of 4 digits"
                      },})}>
              </input>
              <ErrorMessage
                        errors={errors2}
                        name="rc_pin"
                        render={({ messages }) => {
                        console.log("messages", messages);
                        return messages
                            ? Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                            ))
                            : null;
                        }}
                    />
              <button type="submit" style={{letterSpacing: "1px", cursor: "pointer", backgroundColor: "black", display: "flex", justifyContent : "center"}}>{loadingSubmit && <span className="spinner"></span>}Check My Balance</button>
            </form>
          </div>
          </> : 
          <div className="balance_sec">
            <h3>CARD NUMBER</h3>
            <h2>{rcCard.cardNumber && rcCard.cardNumber.replace(/\d{15}(\d{4})/, "***** ***** ***** $1")}</h2>
            <h3>BALANCE</h3>
            <span style={{color : 'black', fontSize : '60px', fontWeight : '500', margin : '15px'}}>{rcCard.balance && '$'+ rcCard.balance}</span>
            <div className="btn_group">
              <button onClick={()=> closeModal()}>CLOSE</button>
              <button onClick={()=> checkBalanceAgain()}>CHECK ANOTHER BALANCE</button>
            </div>
          </div>}
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
