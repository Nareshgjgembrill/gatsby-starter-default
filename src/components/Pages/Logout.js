import React from 'react';

const Logout = () => {
  return (
    <div className="pb-5">
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ marginTop: '80px' }}
      >
        <h3 className="text-center pl-3">
          <img
            alt="Koncert-Logo"
            src="data:image/png;base64,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"
          />
          <sup className="text-dark">&trade;</sup>
        </h3>
      </div>
      <div className="mt-3 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3 className="text-success my-4">
            <i className="fa fa-check-circle mr-2"></i>You've successfully
            logged out
          </h3>
          <h2>
            <a className="text-decoration-none" href="./">
              <i className="fas fa-sign-in-alt mr-2"></i>Login
            </a>{' '}
            <small>again</small>
          </h2>
        </div>
      </div>
      <div className="fixed-bottom py-3 text-center border-top">
        © 2021 - Koncert
      </div>
    </div>
  );
};

export default Logout;
