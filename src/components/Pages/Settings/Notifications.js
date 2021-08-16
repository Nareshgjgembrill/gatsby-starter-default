/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useContext, useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  Collapse,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import UserContext from '../../UserContext';
import {
  FETCH_ALL_OUTCOMES_QUERY,
  FETCH_CALL_OUTCOMES_QUERY,
} from '../../queries/SettingsQuery';
import {
  CREATE_NOTIFICATIONS_SETTINGS_QUERY,
  FETCH_NOTIFICATIONS_SETTINGS_QUERY,
} from '../../queries/NotificationsQuery';
import Button from '../../Common/Button';
import CallListGrid from './CallListGrid';
import { notify, showErrorMessage } from '../../../util/index';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

toast.configure();

const Notifications = () => {
  const upAngle = 'fas fa-angle-double-up fa-lg text-primary mx-2';
  const downAngle = 'fas fa-angle-double-down fa-lg text-primary mx-2';
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const userFilter = `?filter[user][id]=${currentUserId}`;
  const [callListData, setCallListData] = useState([]);
  const [showEmailList, setShowEmailList] = useState(true);
  const [showTextList, setShowTextList] = useState(true);
  // will be uncommented in version 11.5
  // const [showProspectList, setShowProspectList] = useState(
  //   true
  // );
  const [showCallList, setShowCallList] = useState(true);
  const [callListCheckedAll, setCallListCheckedAll] = useState(false);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const limit = 500;
  const offset = 0;

  const {
    data: allNotifications,
    loading: notificationLoading,
    error: notificationError,
  } = useQuery(FETCH_NOTIFICATIONS_SETTINGS_QUERY, {
    variables: { userFilter },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: cadenceOutcomes,
    loading: cadenceOutcomeLoading,
    error: cadenceOutcomeError,
  } = useQuery(FETCH_ALL_OUTCOMES_QUERY, {
    variables: { limit, offset },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: callOutcomes,
    loading: callOutcomeLoading,
    error: callOutcomeError,
  } = useQuery(FETCH_CALL_OUTCOMES_QUERY, {
    variables: { limit, offset },
    notifyOnNetworkStatusChange: true,
  });

  const [
    createNotifications,
    { data: createNotificationsData, loading: createNotificationsLoading },
  ] = useLazyQuery(CREATE_NOTIFICATIONS_SETTINGS_QUERY, {
    onCompleted: (response) => createNotificationsCallback(response, true),
    onError: (response) => createNotificationsCallback(response),
  });

  const createNotificationsCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify(
        'Notifications saved successfully.',
        'success',
        'create_notifications'
      );
    } else {
      showErrorMessage(
        response,
        `Sorry! Failed to save notifications.`,
        createNotificationsData,
        'create_notifications'
      );
    }
  };
  let zipWhipEnabled = false;

  if (allNotifications !== undefined) {
    zipWhipEnabled = allNotifications.allNotifications.data[0].isZipWhipEnable;
  }

  // creating notification list data for calls
  useEffect(() => {
    if (callOutcomes !== undefined && allNotifications !== undefined) {
      const callData = callOutcomes.call.data.map((item) => {
        const productsArray = [];

        if (item.personalDialer) {
          productsArray.push('PD');
        }
        if (item.teamDialer || item.dialingAgent) {
          productsArray.push('TD');
        }
        if (item.clickDialer) {
          productsArray.push('CD');
        }
        const products = productsArray.join(',');

        let selected = false;

        for (
          let i = 0;
          i < allNotifications.allNotifications.data.length;
          i++
        ) {
          if (
            allNotifications.allNotifications.data[i]
              .touchTypeOrProspectActions === 'Call' &&
            item.name === allNotifications.allNotifications.data[i].outcome
          ) {
            selected = allNotifications.allNotifications.data[i].isActive;
          }
        }
        return {
          id: item.id,
          defaultAction: item.defaultAction,
          outcomeGroup: item.memberStage,
          outcome: item.name,
          productType: products,
          touchType: 'Call',
          displayMetrics: item.enableForReport,
          isSelected: selected,
        };
      });

      setCallListData(callData);
    }
  }, [allNotifications, callOutcomes]);

  const callListColumns = [
    {
      Header: 'Call Outcomes',
      accessor: 'outcome',
      width: '50%',
    },
    {
      Header: 'Product Type',
      accessor: 'productType',
      width: '50%',
      Cell: function (props) {
        const productType = props?.value
          ?.replace('PD', 'FD')
          .replace('TD', 'AAD');
        return <span>{productType}</span>;
      },
    },
  ];

  const prospectNotifications = [
    {
      outcomeId: 'Assigned to a Cadence',
      outcome: 'Assigned to a Cadence',
      touchType: 'Prospect',
    },
    {
      outcomeId: 'Exit Cadence',
      outcome: 'Exit Cadence',
      touchType: 'Prospect',
    },
    {
      outcomeId: 'Fall through from Cadence',
      outcome: 'Fall through from Cadence',
      touchType: 'Prospect',
    },
    {
      outcomeId: 'Moved to Another Cadence',
      outcome: 'Moved to Another Cadence',
      touchType: 'Prospect',
    },
  ];

  let emailListData;
  let textListData;
  let prospectListData;
  let emailList;
  let textList;
  // will be uncommented in version 11.5
  // let prospectList;

  // creating notification list data for email, text, prospect
  if (cadenceOutcomes !== undefined && allNotifications !== undefined) {
    emailListData = cadenceOutcomes.allOutcomes.data.map((en) => {
      let selected = false;
      for (let i = 0; i < allNotifications.allNotifications.data.length; i++) {
        if (
          en.touchType.toLowerCase() === 'email' &&
          en.name === allNotifications.allNotifications.data[i].outcome
        ) {
          selected = allNotifications.allNotifications.data[i].isActive;
        }
      }
      return {
        id: en.id,
        name: en.name,
        touchType: en.touchType,
        isSelected: selected,
      };
    });

    textListData = cadenceOutcomes.allOutcomes.data.map((tx) => {
      let selected = false;
      for (let i = 0; i < allNotifications.allNotifications.data.length; i++) {
        if (
          tx.touchType.toLowerCase() === 'text' &&
          tx.name === allNotifications.allNotifications.data[i].outcome
        ) {
          selected = allNotifications.allNotifications.data[i].isActive;
        }
      }
      return {
        id: tx.id,
        name: tx.name,
        touchType: tx.touchType,
        isSelected: selected,
      };
    });

    prospectListData = prospectNotifications.map((item) => {
      let selected = false;
      for (let i = 0; i < allNotifications.allNotifications.data.length; i++) {
        if (
          item.touchType === 'Prospect' &&
          item.outcome === allNotifications.allNotifications.data[i].outcome
        ) {
          selected = allNotifications.allNotifications.data[i].isActive;
        }
      }
      return {
        id: item.outcomeId,
        name: item.outcome,
        touchType: item.touchType,
        isSelected: selected,
      };
    });
  }

  // creating notification list for email, text, prospect
  if (
    cadenceOutcomes !== undefined &&
    (emailListData !== undefined ||
      textListData !== undefined ||
      prospectListData !== undefined)
  ) {
    emailList = emailListData
      .filter((item) => item.touchType.toLowerCase() === 'email')
      .map((item, i) => {
        return (
          <FormGroup check className="mb-2" key={i}>
            <Label check>
              <Input
                type="checkbox"
                id={item.id}
                key={item.id}
                name={item.name}
                touchtype={item.touchType}
                defaultChecked={item.isSelected}
              />
              {item.name}
            </Label>
          </FormGroup>
        );
      });
    if (zipWhipEnabled) {
      textList = cadenceOutcomes.allOutcomes.data
        .filter((item) => item.touchType.toLowerCase() === 'text')
        .map((item, i) => {
          return (
            <FormGroup check className="mb-2" key={i}>
              <Label check>
                <Input
                  type="checkbox"
                  id={item.id}
                  key={item.id}
                  name={item.name}
                  touchtype={item.touchType}
                  defaultChecked={item.isSelected}
                />
                {item.name}
              </Label>
            </FormGroup>
          );
        });
    }
    /* will be uncommented in version 11.5
    prospectList = prospectListData.map((item, i) => {
      return (
        <FormGroup check className="mb-2" key={i}>
          <Label check>
            <Input
              type="checkbox"
              id={item.id}
              name={item.name}
              touchtype={item.touchType}
              defaultChecked={item.isSelected}
            />
            {item.name}
          </Label>
        </FormGroup>
      );
    }); */
  }

  const changeCallListCheckboxState = (row) => {
    const currentCallListData = callListData;
    if (row === true) {
      setCallListCheckedAll(true);
      currentCallListData.forEach((item) => {
        item.isSelected = true;
      });
    } else if (row === false) {
      setCallListCheckedAll(false);
      currentCallListData.forEach((item) => {
        item.isSelected = false;
      });
    } else {
      setCallListCheckedAll(false);
      currentCallListData.forEach((item) => {
        if (item.id === row.original.id) {
          item.isSelected = !item.isSelected;
        }
      });
    }
    setCallListData([...callListData], currentCallListData);
  };

  // saving notifications
  const saveNotifications = (e) => {
    const notifications = [];
    emailListData
      .filter((item) => {
        return item.touchType.toLowerCase() === 'email';
      })
      .map((item) => {
        const input = document.getElementById(item.id);
        const outcome = input.getAttribute('name');
        const selected = input.checked;
        return {
          touchTypeOrProspectActions: 'Email',
          outcome: outcome,
          isActive: selected,
        };
      })
      .forEach((item) => {
        if (item !== undefined) {
          notifications.push(item);
        }
      });

    if (zipWhipEnabled) {
      textListData
        .filter((item) => {
          return item.touchType.toLowerCase() === 'text';
        })
        .map((item) => {
          const input = document.getElementById(item.id);
          const outcome = input.getAttribute('name');
          const selected = input.checked;
          return {
            touchTypeOrProspectActions: 'Text',
            outcome: outcome,
            isActive: selected,
          };
        })
        .forEach((item) => {
          if (item !== undefined) {
            notifications.push(item);
          }
        });
    }

    /* will be uncommented in version 11.5
    eslint-disable-next-line
    const prospectOutcomes = prospectListData.map((pn) => {
      if (pn.touchType === 'Prospect') {
    return {
      touchTypeOrProspectActions: item.touchType,
      outcome: item.name,
      isActive: item.isSelected,
    };
      }
    });
    
    for (let j = 0; j < prospectOutcomes.length; j++) {
      if (prospectOutcomes[j] !== undefined) {
        notifications.push(prospectOutcomes[j]);
      }
    } */

    callListData
      .filter((item) => {
        return item.touchType.toLowerCase() === 'call';
      })
      .map((item) => {
        return {
          touchTypeOrProspectActions: 'Call',
          outcome: item.outcome,
          isActive: item.isSelected,
        };
      })
      .forEach((item) => {
        notifications.push(item);
      });

    const input = {
      notifications: notifications,
    };
    createNotifications({
      variables: { input },
    });
  };

  return (
    <Card className="b card-default">
      <CardHeader className="bg-gray-lighter text-bold">
        Notifications
        <i
          className={
            'ml-2 ' +
            (notificationLoading || cadenceOutcomeLoading || callOutcomeLoading
              ? 'fas fa-spinner fa-spin'
              : notificationError || callOutcomeError || cadenceOutcomeError
              ? 'fas fa-exclamation-circle text-danger'
              : '')
          }
          title={
            notificationError || callOutcomeError || cadenceOutcomeError
              ? FAILED_TO_FETCH_DATA
              : 'Loading'
          }
        ></i>
      </CardHeader>
      <div
        className="p-2 bb bt bg-gray-lighter text-bold pointer"
        onClick={() => {
          setShowEmailList(!showEmailList);
        }}
      >
        <i className="fas fa-envelope mr-2"></i>
        Email Outcomes
        <i className={showEmailList ? upAngle : downAngle}></i>
      </div>
      <Collapse isOpen={showEmailList}>
        <CardBody key={1}>{emailList}</CardBody>
      </Collapse>
      {zipWhipEnabled && (
        <>
          <div
            className="p-2 bb bt bg-gray-lighter text-bold pointer"
            onClick={() => {
              setShowTextList(!showTextList);
            }}
          >
            <i className="fas fa-comments"></i>
            Text Outcomes
            <i className={showTextList ? upAngle : downAngle}></i>
          </div>
          <Collapse isOpen={showTextList}>
            <CardBody key={2}>
              <div> {textList}</div>
            </CardBody>
          </Collapse>
        </>
      )}

      {/* will be uncommented in version 11.5 */}
      {/* <div
        className="p-2 bb bt bg-gray-lighter text-bold pointer"
        onClick={() => {
          setShowProspectList(!showProspectList);
        }}
      >
        <i className="fa fa-user mr-2"></i>
        Prospect Actions
        <i className={showProspectList ? upAngle : downAngle}></i>
      </div>
      <Collapse isOpen={showProspectList}>
        <CardBody key={3}>{prospectList}</CardBody>
      </Collapse> */}

      <div
        className="p-2 bb bt bg-gray-lighter text-bold pointer"
        onClick={() => {
          setShowCallList(!showCallList);
        }}
      >
        <i className="fas fa-users mr-2"></i>
        Call Outcomes
        <i className={showCallList ? upAngle : downAngle}></i>
      </div>
      <Collapse isOpen={showCallList}>
        <CallListGrid
          columns={callListColumns}
          data={callListData}
          changeCallListCheckboxState={changeCallListCheckboxState}
          callListCheckedAll={callListCheckedAll}
        ></CallListGrid>
      </Collapse>
      <CardBody className="bt">
        <Button
          color="primary"
          className="mt-2"
          disabled={createNotificationsLoading}
          icon={
            createNotificationsLoading
              ? 'fas fa-spinner fa-spin'
              : 'fas fa-check'
          }
          onClick={saveNotifications}
        >
          {createNotificationsLoading ? 'Wait' : 'Save'}
        </Button>
      </CardBody>
    </Card>
  );
};
export default Notifications;
