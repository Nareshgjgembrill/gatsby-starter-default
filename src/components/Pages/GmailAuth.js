/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React from 'react';
import { Col, Progress } from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import { GMAIL_OAUTH_QUERY } from '../queries/SettingsQuery';
import Button from '../Common/Button';

const GmailAuth = ({ match }) => {

    let success = false;
    const callBackData = JSON.parse(atob(match.params.callback));
    const { data: gmailResponse, loading: gmailLoading, error } = useQuery(GMAIL_OAUTH_QUERY, { variables: { ...callBackData } });

    if (!gmailLoading && !error) {
        success = gmailResponse.gmail.response === 'success' ? true : false;
    }

    const closeGmailWindow = () => {
        window.opener.location.reload();
        window.close();
    };

    return (
        <>
            <div className="pt-4 d-flex justify-content-center">
                {gmailLoading ? (
                    <Col sm={6} className="my-auto">
                        <Progress animated value="100" />
                    </Col>
                ) : (
                        <div>
                            <Col>
                                <span className="d-flex align-items-center">
                                    <i className={`fas fa-${success ? 'check' : 'times'}-circle fa-2x mr-2 text-${success ? 'success' : 'danger'}`}></i>
                                    {`Your email account ${success ? 'is successfully' : 'is not'} verified`}
                                </span>
                            </Col>
                        </div>
                    )}
            </div>
            <div className="pt-4 d-flex justify-content-center">
                <Button
                    color="primary"
                    onClick={() => {
                        closeGmailWindow();
                    }}
                >
                    Close
                </Button>
            </div>
        </>
    );
};
export default GmailAuth;