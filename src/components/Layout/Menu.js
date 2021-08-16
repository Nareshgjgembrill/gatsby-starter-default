const Menu = [
  {
    name: 'Dashboard',
    icon: 'fas fa-home',
    path: '/dashboard',
    translate: 'sidebar.nav.DASHBOARD',
  },
  {
    name: 'Pending Calls',
    icon: 'fas fa-phone-alt',
    path: '/pendingCalls',
    translate: 'sidebar.nav.PENDINGCALLS',
    title: 'Cadence Pending Calls',
  },
  {
    name: 'To Do',
    icon: 'fas fa-tasks',
    path: '/toDo',
    translate: 'sidebar.nav.TODO',
    title: 'Cadence To-Do',
  },
  {
    name: 'Cadences',
    icon: 'svgicon koncert-cadence-icon',
    path: '/cadences',
    translate: 'sidebar.nav.CADENCES',
  },
  {
    name: 'Prospects',
    icon: 'fas fa-user',
    path: '/prospects/list',
    translate: 'sidebar.nav.PROSPECTS',
  },
  {
    name: 'Accounts',
    icon: 'far fa-building',
    path: '/accounts',
    translate: 'sidebar.nav.ACCOUNTS',
  },
  //TODO Meetings module codes commented - Should be available when all functionality completed
  // {
  //   name: 'Meetings',
  //   icon: 'far fa-calendar-alt',
  //   path: '/meetings',
  //   translate: 'sidebar.nav.MEETINGS',
  // },
  {
    name: 'Templates',
    icon: 'fas fa-envelope',
    path: '/templates',
    translate: 'sidebar.nav.TEMPLATES',
  },
  {
    name: 'Reports',
    icon: 'fas fa-chart-bar',
    path: '/reports',
    translate: 'sidebar.nav.REPORTS',
  },
  {
    name: 'Settings',
    icon: 'fas fa-cog',
    path: '/settings',
    translate: 'sidebar.nav.SETTINGS',
  },
];

export default Menu;
