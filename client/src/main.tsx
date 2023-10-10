import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.ts'
import { GoogleOAuthProvider } from '@react-oauth/google';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={'817866145023-u2r3ksfo2io1v7rjsan0gnp30u3uvrss.apps.googleusercontent.com'} >
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </Provider>
)
