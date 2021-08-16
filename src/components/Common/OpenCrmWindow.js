const windowName = 'SFViewwin';
const windowParams =
  'left=700,width=1000,height=800,top=0,menubar=0,scrollbars=1,resizable =1,titlebar=0,status=0,toolbar=0';

const OpenCrmWindow = (org, crmId, recordType) => {
  let salesForceUrl = '';
  if (org && org.crmType === 'salesforce') {
    salesForceUrl = org.crmInstanceName
      ? org.crmInstanceName + '/' + crmId
      : 'https://login.salesforce.com';
  }
  window.open(salesForceUrl, windowName, windowParams);
};

export default OpenCrmWindow;
