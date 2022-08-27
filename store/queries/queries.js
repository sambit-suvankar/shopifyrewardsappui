import { gql } from "graphql-request";
export const resolveQuery = gql`mutation PaymentSessionResolve($id: ID!, $authorizationExpiresAt: DateTime) {
	paymentSessionResolve(id: $id, authorizationExpiresAt: $authorizationExpiresAt) {
	  paymentSession {
		id
		status {
		  code
		}
		nextAction {
		  action
		  context {
			... on PaymentSessionActionsRedirect {
			  redirectUrl
			}
		  }
		}
	  }
	  userErrors {
		field
		message
	  }
	}
  }
  `
  export const rejectQuery = gql`mutation PaymentSessionReject($id: ID!, $reason: PaymentSessionRejectionReasonInput!) {
    paymentSessionReject(id: $id, reason: $reason) {
      paymentSession {
        id
        status
        nextAction {
          action
          context {
            ... on PaymentSessionActionsRedirect {
              redirectUrl
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
  
  `