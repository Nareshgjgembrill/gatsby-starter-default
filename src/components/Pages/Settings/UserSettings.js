/*
 * @author @Manimegalai V
 * @version V11.0
 */
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import ClButton from '../../Common/Button';
import {
  FAILED_TO_FETCH_DATA,
  notify,
  showErrorMessage,
} from '../../../util/index';
import {
  FETCH_USER_SETTING_QUERY,
  UPDATE_EMAIL_FONT_SETTING_QUERY,
  UPDATE_USER_SETTING_QUERY,
  EMAIL_LIMIT_PER_HOUR,
} from '../../queries/SettingsQuery';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import UserContext from '../../UserContext';

toast.configure();

const UserSettings = () => {
  const { user, loading: userLoading, refetch: refetchUser } = useContext(
    UserContext
  );
  const { data: configurationsData } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];
  const userLicense = !userLoading && user.userLicense;
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const zipwhipLicense = org?.zipwhip
    ? isManagerUser || userLicense.includes('ZIPWHIP')
      ? user.zipwhipSessionKey
      : false
    : false;
  const [dashboardWidgets] = useState(
    user?.defaultCadenceWidgets ? user?.defaultCadenceWidgets?.split(',') : []
  );
  const [menuExpanded, setMenuExpanded] = useState(
    user.isTrucadenceLeftmenuExpanded
  );

  const [defaultFont, setDefaultFont] = useState('Arial');
  const [defaultFontSize, setDefaultFontSize] = useState(11);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const {
    data: fetchUserSettingData,
    loading: fetchUserSettingLoading,
    error: fetchUserSettingError,
  } = useQuery(FETCH_USER_SETTING_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data) {
        const { emailFontFace, emailFontSize } = data?.usersettings?.data[0];
        setDefaultFont(emailFontFace);
        setDefaultFontSize(parseInt(emailFontSize));
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch user setting.',
        fetchUserSettingData,
        'fetch_user_setting'
      );
    },
  });

  const { data: lookUpData } = useQuery(EMAIL_LIMIT_PER_HOUR, {
    variables: {
      lookupName: 'no_of_emails_per_hour',
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const lookUpValue = useMemo(
    () =>
      lookUpData && lookUpData?.emailLimitPerHour?.data[0]?.lookupValue
        ? lookUpData.emailLimitPerHour.data[0].lookupValue
        : '360',
    [lookUpData]
  );

  const [
    updateUserSetting,
    { data: updateUserSettingData, loading: updateUserSettingLoading },
  ] = useLazyQuery(UPDATE_USER_SETTING_QUERY, {
    onCompleted: (response) => {
      notify(
        'User settings has been saved successfully.',
        'success',
        'update_user_setting'
      );
      refetchUser();
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to update user setting.',
        updateUserSettingData,
        'update_user_setting'
      );
    },
  });

  const [
    updateActivityFilterSetting,
    {
      data: updateActivityFilterSettingData,
      loading: updateActivityFilterSettingLoading,
    },
  ] = useLazyQuery(UPDATE_USER_SETTING_QUERY, {
    onCompleted: () => {
      notify(
        'User settings has been saved successfully.',
        'success',
        'update_user_setting'
      );
      refetchUser();
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to update user setting.',
        updateActivityFilterSettingData,
        'update_user_setting'
      );
    },
  });

  const [
    updateEmailFontSetting,
    {
      data: updateEmailFontSettingData,
      loading: updateEmailFontSettingLoading,
    },
  ] = useLazyQuery(UPDATE_EMAIL_FONT_SETTING_QUERY, {
    onCompleted: () => {
      notify(
        'Emails settings has been saved successfully.',
        'success',
        'update_email_setting'
      );
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to update Emails setting.',
        updateEmailFontSettingData,
        'update_email_setting'
      );
    },
  });

  const [
    updateDashBoardWidget,
    { data: updateDashBoardWidgetData, loading: updatedashboardWidgetLoading },
  ] = useLazyQuery(UPDATE_USER_SETTING_QUERY, {
    onCompleted: () => {
      notify(
        'Dashboard widget settings has been saved successfully.',
        'success',
        'update_dashboard_widget_setting'
      );
      refetchUser();
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to dashboard widget setting.',
        updateDashBoardWidgetData,
        'update_dashboard_widget_setting'
      );
    },
  });

  const handleDashboardWidgetSubmit = () => {
    updateDashBoardWidget({
      variables: {
        input: {
          defaultCadenceWidgets: dashboardWidgets?.toString(),
        },
      },
    });
  };

  const handleEmailSettingtSubmit = () => {
    updateEmailFontSetting({
      variables: {
        input: {
          emailFontFace: defaultFont,
          emailFontSize: parseInt(defaultFontSize),
        },
      },
    });
  };

  let userData = [];

  if (!fetchUserSettingLoading && !fetchUserSettingError) {
    userData = fetchUserSettingData.usersettings.data[0];
  }

  const handleChange = () => {
    setMenuExpanded(!menuExpanded);
    updateUserSetting({
      variables: {
        input: {
          isTrucadenceLeftmenuExpanded: !menuExpanded,
        },
      },
    });
  };

  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleActivityFilterChange = (event) => {
    updateActivityFilterSetting({
      variables: {
        input: { defaultActivityFilter: event.target.value },
      },
    });
  };

  const dashboardWidgetsList = [
    'call',
    'email',
    'social',
    'linkedin',
    'text',
    'unassigned',
  ];

  const fontFamily = [
    { name: 'Andale Mono', style: 'andale mono' },
    { name: 'Arial', style: 'arial' },
    { name: 'Arial Black', style: 'arial black' },
    { name: 'Book Antiqua', style: 'book antiqua' },
    { name: 'Comic Sans MS', style: 'comic sans ms' },
    { name: 'Courier New', style: 'courier new' },
    { name: 'Georgia', style: 'georgia' },
    { name: 'Helvetica', style: 'helvetica' },
    { name: 'Impact', style: 'impact' },
    { name: 'Symbol', style: 'symbol' },
    { name: 'Tahoma', style: 'tahoma' },
    { name: 'Terminal', style: 'terminal' },
    { name: 'Times New Roman', style: 'times new roman' },
    { name: 'Trebuchet MS', style: 'trebuchet ms' },
    { name: 'Verdana', style: 'verdana' },
    { name: 'Webdings', style: '' },
    { name: 'Wingdings', style: '' },
  ];

  const fontSize = [11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 70];

  const handleDashboardWidgetChange = (e) => {
    const selectedDialerValue = e.currentTarget.getAttribute('data-tab-value');
    const ischecked = e.currentTarget.checked;
    if (ischecked) {
      dashboardWidgets.push(selectedDialerValue);
    } else {
      const index = dashboardWidgets.indexOf(selectedDialerValue);
      if (index > -1) {
        dashboardWidgets.splice(index, 1);
      }
    }
  };
  return (
    <Card className="b">
      <CardHeader className="bg-gray-lighter text-bold">
        User Settings
        <i
          className={
            'ml-2 ' +
            (fetchUserSettingLoading || userLoading
              ? 'fas fa-spinner fa-spin'
              : fetchUserSettingError
              ? 'fas fa-exclamation-circle text-danger'
              : '')
          }
          title={fetchUserSettingError ? FAILED_TO_FETCH_DATA : 'Loading'}
        ></i>
      </CardHeader>
      {!fetchUserSettingLoading && !fetchUserSettingError && (
        <CardBody className="bt">
          <p>
            <strong>Emails</strong>
          </p>
          <FormGroup row>
            <Label
              xl={2}
              lg={3}
              md={3}
              sm={3}
              className="pr-0 text-nowrap mr-xl-2"
            >
              Email Govern Limit
            </Label>
            <Col xl={1} lg={2} md={2} sm={2} className="px-xl-0 mx-2">
              <Input
                type="text"
                value={userData.perDayUserLimit}
                disabled
              ></Input>
            </Col>
            <Label xl={3} lg={3} md={3} sm={2} className="text-nowrap">
              Emails per day
            </Label>
          </FormGroup>
          <FormGroup row>
            <Label
              xl={2}
              lg={3}
              md={3}
              sm={3}
              className="pr-0 text-nowrap mr-xl-2"
            >
              Total Emails Sent
            </Label>
            <Col xl={1} lg={2} md={2} sm={2} className="px-xl-0 mx-2">
              <Input type="text" value={userData.perDayUsed} disabled></Input>
            </Col>
            <Label xl={3} lg={3} md={3} sm={3} className="text-nowrap">
              In the Last 24 hours
            </Label>
          </FormGroup>
          <FormGroup row>
            <Label
              xl={2}
              lg={3}
              md={3}
              sm={3}
              className="pr-0 text-nowrap mr-xl-2"
            >
              # of Emails Attempt
            </Label>
            <Col xl={1} lg={2} md={2} sm={2} className="px-xl-0 mx-2">
              <Input
                type="text"
                value={userData.noOfEmailAttemptsPerDay}
                disabled
              ></Input>
            </Col>
            <Label xl={3} lg={3} md={3} sm={3} className="text-nowrap">
              Per prospect per day
            </Label>
          </FormGroup>
          <FormGroup row>
            <Label
              xl={2}
              lg={3}
              md={3}
              sm={3}
              className="pr-0 text-nowrap mr-xl-2"
            >
              Email Govern Limit
            </Label>
            <Col xl={1} lg={2} md={2} sm={2} className="px-xl-0 mx-2">
              <Input type="text" value={lookUpValue} disabled></Input>
            </Col>
            <Label xl={3} lg={3} md={3} sm={3} className="text-nowrap">
              Emails per hour
            </Label>
          </FormGroup>
          <FormGroup row>
            <Label
              xl={2}
              lg={3}
              md={3}
              sm={3}
              className="pr-0 text-nowrap mr-xl-2"
              for="fontFamily"
            >
              Default Font Family
            </Label>

            <Col xl={2} lg={2} md={2} sm={2} className="px-xl-0 mx-2">
              <Input
                type="select"
                id="font_family"
                name="fontFamily"
                value={defaultFont}
                onChange={(e) => {
                  setDefaultFont(e.target.value);
                }}
              >
                {fontFamily?.map((font) => {
                  return (
                    <option
                      key={font.name}
                      value={font.name}
                      style={{ fontFamily: font.style }}
                    >
                      {font.name}
                    </option>
                  );
                })}
              </Input>
            </Col>
            <Col xl={2} lg={2} md={2} sm={2} style={{ maxWidth: '100px' }}>
              <Input
                type="select"
                id="font_size"
                name="fontSize"
                value={defaultFontSize}
                onChange={(e) => {
                  setDefaultFontSize(e.target.value);
                }}
              >
                {fontSize?.map((size) => {
                  return (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  );
                })}
              </Input>
            </Col>
          </FormGroup>

          <ClButton
            type="submit"
            color="primary"
            title="save"
            onClick={handleEmailSettingtSubmit}
            icon={
              updateEmailFontSettingLoading
                ? 'fas fa-spinner fa-spin'
                : 'fa fa-check'
            }
          >
            {updateEmailFontSettingLoading ? 'Wait...' : 'Save'}
          </ClButton>
        </CardBody>
      )}
      <CardBody className="bt">
        <p>
          <strong>Prospects</strong>
        </p>
        <FormGroup row className="align-items-center">
          <Label xl={2} lg={4} md={4} sm={4} className="text-nowrap mr-xl-5">
            Duplicate Check Enable
          </Label>
          <Col xl={1} lg={2} md={2} sm={2} className="text-nowrap">
            <Input
              type="radio"
              name="duplicateCheckEnable"
              checked={userData.checkCalllistRecordsDuplicates === true}
              disabled={userData.checkCalllistRecordsDuplicates === false}
              readOnly
            ></Input>
            Yes
          </Col>
          <Col xl={1} lg={1} md={1} sm={1} className="pl-0 text-nowrap">
            <Input
              type="radio"
              name="duplicateCheckEnable"
              checked={userData.checkCalllistRecordsDuplicates === false}
              disabled={userData.checkCalllistRecordsDuplicates === true}
              readOnly
            ></Input>
            No
          </Col>
        </FormGroup>
        <FormGroup
          className="mb-0"
          row
          style={{
            display:
              userData.checkCalllistRecordsDuplicates === false ? 'none' : '',
          }}
        >
          <Label
            xl={2}
            lg={4}
            md={4}
            sm={4}
            className="pr-0 mr-xl-5 text-nowrap"
          >
            Duplicate Check based{' '}
          </Label>
          <Col xl={2} lg={2} md={2} sm={2} className="ml-lg-n2 px-0">
            <Input
              className="wd-sm"
              type="select"
              value={
                userData?.checkDuplicatesBasedOn
                  ? userData.checkDuplicatesBasedOn
                  : undefined
              }
              disabled
            >
              <option value="USER_LEVEL">User Level</option>
              <option value="ORG_LEVEL">Org Level</option>
            </Input>
          </Col>
        </FormGroup>
      </CardBody>
      <CardBody className="bt">
        <p className="mb-3">
          <strong>Default Menu</strong>
          <i
            className={
              'ml-2 ' +
              (updateUserSettingLoading
                ? 'fas fa-spinner fa-spin'
                : fetchUserSettingError
                ? 'fas fa-exclamation-circle text-danger'
                : '')
            }
            title={
              fetchUserSettingError ? 'Sorry! Failed to save data.' : 'Saving'
            }
          ></i>
        </p>
        <FormGroup check className="mb-0">
          <Input
            type="checkbox"
            id="menu_expanded"
            name="menuexpanded"
            checked={menuExpanded}
            onChange={handleChange}
          />
          <Label for="menu_expanded">Expand Menu Items upon screen load</Label>
        </FormGroup>
      </CardBody>

      <CardBody className="bt">
        <p>
          <strong>Activity Filter</strong>
          <i
            className={
              'ml-2 ' +
              (updateActivityFilterSettingLoading
                ? 'fas fa-spinner fa-spin'
                : fetchUserSettingError
                ? 'fas fa-exclamation-circle text-danger'
                : '')
            }
            title={
              fetchUserSettingError ? 'Sorry! Failed to save data.' : 'Saving'
            }
          ></i>
        </p>
        <FormGroup row className="mb-0">
          <Label
            xl={2}
            lg={3}
            md={3}
            sm={3}
            className="pr-0 text-nowrap mr-xl-4"
            for="defaultActivityFilter"
          >
            Default View
          </Label>

          <Col xl={2} lg={2} md={2} sm={2} className="px-xl-0 ml-xl-n4">
            <Input
              type="select"
              id="defaultActivityFilter"
              name="defaultActivityFilter"
              value={
                user?.defaultActivityFilter ? user?.defaultActivityFilter : ''
              }
              onChange={handleActivityFilterChange}
            >
              <option value="all">All</option>
              <option value="call">Calls</option>
              <option value="email">Emails</option>
              <option value="text">Texts</option>
              <option value="others">Social</option>
              <option value="linkedin">LinkedIn</option>
            </Input>
          </Col>
        </FormGroup>
      </CardBody>
      <CardBody className="bt">
        <p className="mb-3">
          <strong>Dashboard widgets</strong>
        </p>
        {dashboardWidgetsList?.map((widget) => {
          return (
            <FormGroup
              check
              className="mb-0"
              key={widget}
              hidden={widget === 'text' && !zipwhipLicense}
            >
              <Input
                type="checkbox"
                id={widget}
                name={widget}
                data-tab-value={widget}
                defaultChecked={dashboardWidgets?.includes(widget)}
                onChange={handleDashboardWidgetChange}
              />
              <Label for={widget}>{Capitalize(widget)}</Label>
            </FormGroup>
          );
        })}
        <ClButton
          type="submit"
          color="primary"
          title="save"
          onClick={handleDashboardWidgetSubmit}
          icon={
            updatedashboardWidgetLoading
              ? 'fas fa-spinner fa-spin'
              : 'fa fa-check'
          }
        >
          {updatedashboardWidgetLoading ? 'Wait...' : 'Save'}
        </ClButton>
      </CardBody>
    </Card>
  );
};
export default UserSettings;
