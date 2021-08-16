import gql from 'graphql-tag';

export const FETCH_CALENDAR_SETTINGS = gql`
  query {
    calendarSetting @rest(type: "Prospect", path: "meetings/settings") {
      calendarList
      data
    }
  }
`;

export const SAVE_CALENDAR_SETTINGS = gql`
  query(
    $calendarType: String!
    $meetingLink: String!
    $meetingLinkDuration: String!
    $meetingLocation: String!
    $meetingDescription: String!
    $includeWeekend: String!
    $meetingAvailablity: [Episode!]
    $includeRescheduleInMeetingInvite: String!
    $allowOthersToIincludeYou: false
    $isPriorNoticeNeeded: String!
    $priorNoticeTimeInterval: Int!
    $priorNoticeTimeIntervalUnit: String!
    $isAdvanceBookingAllowedToProspect: String!
    $advanceBookingTimeInterval: Int!
    $advanceBookingTimeIntervalUnit: String!
    $isBufferBetweenMeetings: String!
    $bufferTimeInterval: Int!
    $bufferTimeIntervalUnit: String!
    $actionUserBookMeetingWithProspect: String!
    $actionProspectScheduleMeetingWithUserBasedonAvialability: String!
    $noActionRequired: String!
    $meetingSlotDuration: Int!
    $isEmailIdVerified: String!
  ) {
    saveSettings(
      input: {
        calendarType: $calendarType
        meetingLink: $meetingLink
        meetingLinkDuration: $meetingLinkDuration
        meetingLocation: $meetingLocation
        meetingDescription: $meetingDescription
        includeWeekend: $includeWeekend
        meetingAvailablity: $meetingAvailablity
        includeRescheduleInMeetingInvite: $includeRescheduleInMeetingInvite
        allowOthersToIincludeYou: $allowOthersToIincludeYou
        isPriorNoticeNeeded: $isPriorNoticeNeeded
        priorNoticeTimeInterval: $priorNoticeTimeInterval
        priorNoticeTimeIntervalUnit: $priorNoticeTimeIntervalUnit
        isAdvanceBookingAllowedToProspect: $isAdvanceBookingAllowedToProspect
        advanceBookingTimeInterval: $advanceBookingTimeInterval
        advanceBookingTimeIntervalUnit: $advanceBookingTimeIntervalUnit
        isBufferBetweenMeetings: $isBufferBetweenMeetings
        bufferTimeInterval: $bufferTimeInterval
        bufferTimeIntervalUnit: $bufferTimeIntervalUnit
        actionUserBookMeetingWithProspect: $actionUserBookMeetingWithProspect
        actionProspectScheduleMeetingWithUserBasedonAvialability: $actionProspectScheduleMeetingWithUserBasedonAvialability
        noActionRequired: $noActionRequired
        meetingSlotDuration: $meetingSlotDuration
        isEmailIdVerified:$isEmailIdVerified
      }
    )
      @rest(
        method: "PUT"
        type: "MeetingSettings"
        path: "meetings/settings"
        input: input
      ) {
      data
    }
  }
`;

export const SEND_MEETING_INVITE = gql`
  query(
    $startDate: String!
    $endDate: String!
    $title: String!
    $location: String!
    $description: String!
    $chooseRecipients: String!
    $otherUser: Int!
    $prospectEmail: String!
    $startDateFormat: String!
    $endDateFormat: String!
  ) {
    meetingInvite(
      input: {
        startDate: $startDate
        endDate: $endDate
        title: $title
        location: $location
        description: $description
        chooseRecipients: $chooseRecipients
        otherUser: $otherUser
        prospectEmail: $prospectEmail
        startDateFormat: $startDateFormat
        endDateFormat: $endDateFormat
      }
    )
      @rest(
        method: "POST"
        type: "MeetingInvite"
        path: "meetingSchedules/book"
        input: input
      ) {
      data
    }
  }
`;

export const DELETE_MEETING_INVITE = gql`
  query($eventId: ID!) {
    deleteMeeting(eventId: $eventId)
      @rest(
        type: "meeting"
        path: "meetingSchedules/{args.eventId}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const FETCH_BOOKED_EVENTS = gql`
  query {
    booked
      @rest(type: "BookedEvents", path: "meetingSchedules/bookedMeetings") {
      data
    }
  }
`;

export const FETCH_BLOCKED_EVENTS = gql`
  query($startDate: String!, $endDate: String!) {
    blockedEvents(startDate: $startDate, endDate: $endDate)
      @rest(
        type: "BlockedEvents"
        path: "meetingSchedules/blockedEvents?startDate={args.startDate}&endDate={args.endDate}"
      ) {
      data
    }
  }
`;
