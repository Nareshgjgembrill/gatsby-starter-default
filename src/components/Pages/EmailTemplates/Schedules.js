import React from 'react';
import { Table } from 'reactstrap';

const emailData = [
  {
    id: 1,
    name: 'khaja',
    timeZone: 'MST',
    owner: 'Nil',
    lastActivity: 'Mar 1',
  },
  {
    id: 2,
    name: 'moulali',
    timeZone: 'CST',
    owner: 'Nil',
    lastActivity: 'Mar 2',
  },
  {
    id: 3,
    name: 'shaik',
    timeZone: 'PST',
    owner: 'Nil',
    lastActivity: 'Mar 3',
  },
  {
    id: 4,
    name: 'ali',
    timeZone: 'EST',
    owner: 'Nil',
    lastActivity: 'Mar 4',
  },
];

const Schedules = (props) => {
  const emailDataList = emailData.map((ed) => {
    return (
      <tr key={ed.id}>
        <td>{ed.name}</td>
        <td>{ed.timeZone}</td>
        <td className="text-primary">{ed.owner}</td>
        <td>{ed.lastActivity}</td>
      </tr>
    );
  });
  return (
    <div>
      <Table striped hover>
        <thead>
          <tr>
            <td>Name</td>
            <td>Time Zone</td>
            <td>Owner</td>
            <td>Last Activity</td>
          </tr>
        </thead>
        <tbody>
          {emailDataList.length > 0 ? emailDataList : 'No Data Available'}
        </tbody>
      </Table>
    </div>
  );
};

export default Schedules;
