import React, {useState, useRef, useEffect} from "react";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { removeRcNumber } from "../store/actions/apiStatusActions";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";

function RewardCardDetailsContainer ({ rcDetails, rcCard, removeRcNumber, onRcNumberSubmit, toggleModal, loadingSubmit, appliedMsg, costToCredit}){
    const [ collapsible, setCollapsible] = useState(false);
    const rewardCerf = useRef()
    const {
        register : register3,
        formState: { errors : errors3 },
        handleSubmit : handleSubmit3,
        reset 
      } = useForm({ criteriaMode: "all" });
    
    //To Hide and unhide Reward card details collapsible component
    const onClickReward = ()=> {
        rewardCerf.current.classList.toggle('hide-reward')
        setCollapsible(!collapsible)
      }
    
    // To Delete single RC number. Action derived from redux
    const deleteRcNumber = (e) =>{
        console.log(e.target.id)
        removeRcNumber(e.target.id)
    }

    // To reset the Field value after the card Information get stored inside redux store.
    useEffect(()=> {
        reset()
    }, [rcDetails])

    return(
        <div className="reward-details-container">
                <label htmlFor="reward" className="reward" onClick={()=> onClickReward()}>
                  {collapsible ? <IoMdArrowDropdown style={{ height: "25px", width: "10%" }}/> : <IoMdArrowDropright style={{ height: "25px", width: "10%" }}/>}
                    
                    <span style={{color : "black", fontWeight: "bold"}}>PAY WITH A REWARD CERTIFICATE</span>  
                </label>

                <div className="reward-cards">
                  {rcDetails.length > 0 ? 
                  rcDetails.map((e,i) => (<div className="rc-card" key={i}><span>CERTIFICATE {e.cardNumber.replace(/\d{15}(\d{4})/, "***** ***** ***** $1")}</span> <button id={e.cardNumber} onClick={(e)=> deleteRcNumber(e) }>REMOVE</button></div>)) : 
                  <></>
                  }
                </div>
                
                <div className="rewards-certificate hide-reward" ref={rewardCerf}>
                    <form style={{ width: "100%", margin: "0"}} onSubmit={handleSubmit3(onRcNumberSubmit)}>
                      <div style={{display:"flex", justifyContent:"space-between"}}>
                        <div style={{width: "75%", marginRight: "10px"}}>
                          <label htmlFor="rcnumber">Reward Certificate Number</label>
                          <input maxLength="19" type="number" disabled={costToCredit == 0 ? true : false} id="rcnumber" {...register3("rcnumber",{minLength: {
                                value: 19,
                                message: "Card number must be of 19 digits",
                            }})}></input>
                      
                        </div>
                        <div style={{width : "25%"}}>
                          <label htmlFor="rcnumber">PIN Number</label>
                          <input maxLength="4" type="number" disabled={costToCredit == 0 ? true : false} id="rcpin" {...register3("rcpin",{minLength: {
                                value: 4,
                                message: "PIN must be of 4 digits",
                            }})}></input>
                        </div>
                      </div>
                      <div className="rewardButtons">
                        <button disabled={loadingSubmit || costToCredit == 0} style={{display: "flex", justifyContent: 'center', alignItems: 'center'}} type="submit" value="Apply">{loadingSubmit && <span className="spinner"></span>}APPLY</button>
                        <button type="button" onClick={()=> toggleModal()}>CHECK BALANCE</button>
                      </div>

                      {/* Error Handling */}
                      {appliedMsg && !rcCard.errorMsg ? 
                      <span>${rcDetails.length > 0 && rcDetails[rcDetails.length -1].amountPaidByRC} successfully applied to order. Your card will have ${rcDetails.length > 0 && (rcCard.balance - rcDetails[rcDetails.length -1].amountPaidByRC).toFixed(2)} balance remaining after this transaction is completed.</span>
                      :
                      <span>{rcCard.errorMsg}</span>}
                      <ErrorMessage
                        errors={errors3}
                        name="rcnumber"
                        render={({ messages }) => {
                        console.log("messages", messages);
                        return messages
                            ? Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                            ))
                            : null;
                        }}
                    />
                      <ErrorMessage
                        errors={errors3}
                        name="rcpin"
                        render={({ messages }) => {
                        console.log("messages", messages);
                        return messages
                            ? Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                            ))
                            : null;
                        }}
                    />
                    </form>
                </div>
              </div>
    )

}
function mapStateToProps(state, ownProps) {
    return {
      rcDetails : state.rewardReducer.rcDetails
    };
  }
const mapDispatchToProps = (dispatch) => ({
    addRcNumber : (payload)=> dispatch(addRcNumber(payload)),
    removeRcNumber : (payload) => dispatch(removeRcNumber(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(RewardCardDetailsContainer)
