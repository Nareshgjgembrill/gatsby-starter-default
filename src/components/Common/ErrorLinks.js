import React from 'react';

const year = new Date().getFullYear();

const ErrorLinks = ({ props, gotoApp }) => {
  return (
    <>
      <ul className="list-inline text-center text-sm mb-4">
        {gotoApp && (
          <>
            <li className="list-inline-item">
              <a href="/" className="text-primary">
                Goto App
              </a>
            </li>
            <li className="text-muted list-inline-item">|</li>
          </>
        )}
        <li className="list-inline-item">
          <a href="/logout?returnTo=login" className="text-primary">
            Login as another user
          </a>
        </li>
        <li className="text-muted list-inline-item">|</li>
        <li className="list-inline-item">
          <a href="/logout" className="text-primary">
            Logout
          </a>
        </li>
      </ul>
      <div className="p-3 text-center">
        <span>&copy; {year} - Koncert</span>
        <span>{props.productName}</span>
        <br />
        <span>{props.tagLine}</span>
      </div>
    </>
  );
};

export default ErrorLinks;
