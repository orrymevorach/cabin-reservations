import { gql } from '@apollo/client';

export const CABIN_FRAGMENT = gql`
  fragment CabinFields on cabins {
    id
    openBeds
    name
    status
    totalBeds
    unit
    additionalInformation
    images
    attendees {
      name
      cabin {
        name
      }
    }
    frontBunkLeft {
      id
      name
    }
    frontCotLeft {
      id
      name
    }
    backCotLeft {
      id
      name
    }
    frontLoftLeft {
      id
      name
    }
    backLoftLeft {
      id
      name
    }
    backBunkLeft {
      id
      name
    }
    frontBunkRight {
      id
      name
    }
    frontCotRight {
      id
      name
    }
    backCotRight {
      id
      name
    }
    frontLoftRight {
      id
      name
    }
    backLoftRight {
      id
      name
    }
    backBunkRight {
      id
      name
    }
  }
`;

export const GROUP_FRAGMENT = gql`
  fragment GroupFields on groups {
    id
    members {
      id
      name
      emailAddress
      paymentIntent
      cabin {
        ...CabinFields
      }
    }
  }
  ${CABIN_FRAGMENT}
`;

export const USER_FRAGMENT = gql`
  fragment UserFields on tickets {
    id
    name
    emailAddress
    paymentIntent
    cabin {
      ...CabinFields
    }
    group {
      ...GroupFields
    }
  }
  ${CABIN_FRAGMENT}
  ${GROUP_FRAGMENT}
`;
