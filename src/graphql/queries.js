import { gql } from '@apollo/client';
import { CABIN_FRAGMENT, USER_FRAGMENT } from './fragments';

export const GET_CABINS = gql`
  query GetCabins {
    cabins {
      ...CabinFields
    }
  }
  ${CABIN_FRAGMENT}
`;

export const GET_CABIN = gql`
  query GetCabin($cabinName: String) {
    cabins(name: $cabinName) {
      ...CabinFields
    }
  }
  ${CABIN_FRAGMENT}
`;

export const RESERVE_SPOT_IN_CABIN = gql`
  mutation ReserveSpot($cabinId: String, $attendeeId: String) {
    update_ticketPurchases(
      id: $attendeeId
      cabin: [$cabinId]
      frontBunkLeft: []
      frontCotLeft: []
      backCotLeft: []
      frontLoftLeft: []
      backLoftLeft: []
      backBunkLeft: []
      frontBunkRight: []
      frontCotRight: []
      backCotRight: []
      frontLoftRight: []
      backLoftRight: []
      backBunkRight: []
    ) {
      id
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String) {
    ticketPurchases(emailAddress: $email) {
      id
      paymentIntent
      name
      emailAddress
      cabin {
        ...CabinFields
      }
    }
  }
  ${CABIN_FRAGMENT}
`;

export const GET_USER_BY_ID = gql`
  query GetUser($id: String) {
    ticketPurchases(id: $id) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const RESERVE_BED = gql`
  mutation ReserveBed(
    $userId: String
    $frontBunkLeft: [String]
    $frontCotLeft: [String]
    $backCotLeft: [String]
    $frontLoftLeft: [String]
    $backLoftLeft: [String]
    $backBunkLeft: [String]
    $frontBunkRight: [String]
    $frontCotRight: [String]
    $backCotRight: [String]
    $frontLoftRight: [String]
    $backLoftRight: [String]
    $backBunkRight: [String]
  ) {
    update_ticketPurchases(
      id: $userId
      frontBunkLeft: $frontBunkLeft
      frontCotLeft: $frontCotLeft
      backCotLeft: $backCotLeft
      frontLoftLeft: $frontLoftLeft
      backLoftLeft: $backLoftLeft
      backBunkLeft: $backBunkLeft
      frontBunkRight: $frontBunkRight
      frontCotRight: $frontCotRight
      backCotRight: $backCotRight
      frontLoftRight: $frontLoftRight
      backLoftRight: $backLoftRight
      backBunkRight: $backBunkRight
    ) {
      id
    }
  }
`;

export const CLEAR_CURRENT_BED_SELECTION = gql`
  mutation ReserveBed($userId: String) {
    update_ticketPurchases(
      id: $userId
      frontBunkLeft: []
      frontCotLeft: []
      backCotLeft: []
      frontLoftLeft: []
      backLoftLeft: []
      backBunkLeft: []
      frontBunkRight: []
      frontCotRight: []
      backCotRight: []
      frontLoftRight: []
      backLoftRight: []
      backBunkRight: []
    ) {
      id
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($groupName: String, $members: [String]) {
    insert_groups(groupName: $groupName, members: $members) {
      id
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: String, $members: [String]) {
    update_groups(id: $id, members: $members) {
      id
    }
  }
`;

export const CHECK_IN = gql`
  mutation CheckIn(
    $id: String
    $arrivalDay: String
    $arrivalTime: String
    $name: String
    $questions: String
    $city: String
    $howDidYouHearAboutHighlands: String
    $birthday: String
  ) {
    insert_checkIn(
      name: $name
      arrivalDay: $arrivalDay
      arrivalTime: $arrivalTime
      profile: [$id]
      questions: $questions
      city: $city
      howDidYouHearAboutHighlands: $howDidYouHearAboutHighlands
      birthday: $birthday
    ) {
      id
    }
  }
`;
