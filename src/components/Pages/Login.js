import React, { useState ,useContext} from "react";
import { Link,  withRouter } from "react-router-dom";
import { Input } from "reactstrap";

import {useTracking, Logo, FormValidator } from '@nextaction/components';

import CLLogin from '../../apollo/loginClient';

const Login = ({ actions, history }) => {
  const tracker = useTracking();
  const [username, setUsername] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const [password, setPassword] = useState("");
  const [formLogin, setformLogin] = useState({});
  
  /**
   * Validate input using onChange event
   * @param  {String} formName The name of the form in the state object
   * @return {Function} a function used for the event
   */
  const validateOnChange = (event) => { 
    const input = event.target;
    const form = input.form;
    const formError = form.errors;
    const value = input.type === "checkbox" ? input.checked : input.value;
    const result = FormValidator.validate(input);
   
    if (input.name == "username") {
      setUsername(value);
    }
    
    if (input.name == "password") {
      setPassword(value);
    }
   
    setformLogin({ ...formLogin, [input.name]: value, errors: {
      formError,
      [input.name]: result
    } });

  };

  const onSubmit = (e) => {
    e.preventDefault();
    tracker.track('Login Clicked');
    const form = e.target;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ["INPUT", "SELECT"].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    console.log(hasError ? "Form has errors. Check!" : "Form Submitted!");
    setformLogin({ ...formLogin, formName,errors});
    if(!hasError){
      
      CLLogin( formLogin.username, formLogin.password, history ).then( res => {
              
        localStorage.setItem( 'tokenData', res.data );
        localStorage.setItem( 'token', res.data.access_token );
        
        history.push("/dashboard");
      } );
    }
    e.preventDefault();
  };

 const hasError = (formName, inputName, method) => {
    return formLogin &&
    formLogin.errors &&
    formLogin.errors[inputName] &&
    formLogin.errors[inputName][method]
}
  const year = new Date().getFullYear();
  return (
	<div className="block-center mt-4 wd-xl">
      <div className="card card-flat">
        <div className="card-header text-center bg-dark">
          <a href="#">
            <img className="block-center" src={Logo} alt="Logo" width={150} />
          </a>
        </div>
        <div className="card-body">
          <p className="text-center py-2">SIGN IN TO CONTINUE.</p>
          <form className="mb-3" name="formLogin" onSubmit={onSubmit}>
            <div className="form-group">
              <div className="input-group with-focus">
                <Input
                  type="text"
                  name="username"
                  className="border-right-0"
                  placeholder="Enter username"
                  invalid={
                    hasError("formLogin", "username", "required") ||
                    hasError("formLogin", "username", "text")
                  }
                  onChange={validateOnChange}
                  data-validate='["required"]'
                  value={username}
                />
                <div className="input-group-append">
                  <span className="input-group-text text-muted bg-transparent border-left-0">
                    <em className="fa fa-envelope"></em>
                  </span>
                </div>
                {hasError("formLogin", "username", "required") && (
                  <span className="invalid-feedback">Field is required</span>
                )}
                {hasError("formLogin", "username", "text") && (
                  <span className="invalid-feedback">
                    Field must be valid username
                  </span>
                )}
              </div>
            </div>
            <div className="form-group">
              <div className="input-group with-focus">
                <Input
                  type="password"
                  id="id-password"
                  name="password"
                  className="border-right-0"
                  placeholder="Password"
                  invalid={hasError("formLogin", "password", "required")}
                  onChange={validateOnChange}
                  data-validate='["required"]'
                  value={password}
                />
                <div className="input-group-append">
                  <span className="input-group-text text-muted bg-transparent border-left-0">
                    <em className="fa fa-lock"></em>
                  </span>
                </div>
                <span className="invalid-feedback">Field is required</span>
              </div>
            </div>
            <div className="clearfix">
              <div className="checkbox c-checkbox float-left mt-0">
                <label>
                  <input type="checkbox" value="" name="remember" />
                  <span className="fa fa-check"></span>Remember Me
                </label>
              </div>
              <div className="float-right">
                <Link to="recover" className="text-muted">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <button className="btn btn-block btn-primary mt-3" type="submit">
              Login
            </button>
          </form>
          <p className="pt-3 text-center">Need to Signup?</p>
          <Link to="register" className="btn btn-block btn-secondary">
            Register Now
          </Link>
          <div className="pt-3 text-center">
          { loginFailed && <div className="text-danger">Incorrect username or password!</div> }
           </div>
        </div>
      </div>
      <div className="p-3 text-center">
        <span className="mr-2">&copy;</span>
        <span>{year}</span>
        <span className="mx-2">-</span>
        <span>TruStories</span>
        <br />
        <span>Sales Development Platform</span>
      </div>
    </div>
  );
};

// const mapDispatchToProps = (dispatch) => ({
//   actions: bindActionCreators(actions, dispatch),
// });
// export default connect(null, mapDispatchToProps)(withRouter(Login));
export default withRouter(Login)