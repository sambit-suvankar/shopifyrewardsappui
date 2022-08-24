import '../styles/globals.css'
import '../styles/App.css'
import { wrapper, store } from "../store/store";
import { Provider, Provider as ReduxProvider } from "react-redux";

function MyApp({ Component, pageProps }) {
  return (<>
  <Provider store={store}>
      <Component {...pageProps} />
  </Provider>
  
  </>) 
}

export default wrapper.withRedux(MyApp);
