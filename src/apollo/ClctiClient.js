import axios from 'axios';
//Production context path
const ClctiClient = (formData, requestUrl, token, signatureContent) => {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (signatureContent) {
    headers['X-ConnectLeader-Signature'] = signatureContent;
  }
  return axios({
    method: 'post',
    url: requestUrl,
    headers: headers,
    data: formData,
  });
};

export default ClctiClient;
