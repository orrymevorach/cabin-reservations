import { useState } from 'react';
import Button from '@/components/shared/button/button';
import Checkbox from '@/components/shared/checkbox/checkbox';
import styles from './waiver.module.scss';
import { acceptWaiver } from '@/lib/airtable';
import { sendQRCode } from '@/lib/emails';
import { syncGuestIntake } from '@/lib/platform-api';
import { useCheckIn } from '@/context/check-in-context';
import { logSentryError } from '@/utils/sentry-utils';

const agreements = [
  {
    id: 'readAndUnderstand',
    label: 'I read and understand this document:',
  },
  {
    id: 'understandPurpose',
    label: 'I understand the purpose of this document:',
  },
  {
    id: 'understandInherentRisks',
    label:
      'I understand that this Event including travel to/from this Event has inherent risks:',
  },
  {
    id: 'assumeRisks',
    label: 'I assume these risks:',
  },
  {
    id: 'photoRelease',
    label: 'I have read, acknowledged, and accepted the Photo Release:',
  },
  {
    id: 'codeOfConduct',
    label:
      'I have read, acknowledged, and accepted the HIGHLANDS MUSIC FESTIVAL Code of Conduct:',
  },
  {
    id: 'vendorWaivers',
    label:
      'I have read, acknowledged, and accepted the Addition Vendor Waivers:',
  },
  {
    id: 'acceptRisksAndHazards',
    label:
      'I freely and voluntarily accept and assume all such risks, dangers, and hazards and the possibility of personal injury, death, violence, property damage or loss, during all the time of this Event, resulting from activities during the Event, including, but not limited to traveling to and from the Event Location.',
  },
  {
    id: 'acceptResponsibility',
    label:
      'I accept my responsibility to abide by the laws of Canada and the Province of Ontario, to ensure that I have adequate medical coverage, protect personal possessions, and obey all the rules set out for the Event.',
  },
  {
    id: 'holdHarmless',
    label:
      'In consideration of approval to participate in the Event, I and any personal representative, hold harmless, release and forever discharge the Event and the Location, its organizers, attendees, volunteers, agents, trainees, contractors, or employees from any and all actions, causes of actions, including negligence, claims and demands for damages, loss or injury, resulting from or arising out of my participation in the Event.',
  },
  {
    id: 'indemnify',
    label:
      'I indemnify and save harmless the Event and the Location, its organizers, attendees, volunteers, agents, trainees, or employees from any and all actions, causes of actions, demands, expenses or losses whatsoever which they may bear as a result of my participation in the Event, by reason of damage to any and all property and any and all personal injuries, including death of others or myself.',
  },
];

const initialAgreementsState = agreements.reduce((state, agreement) => {
  state[agreement.id] = false;
  return state;
}, {});

export default function Waiver({ checkInRecordId, user }) {
  const { state, dispatch, actions, stages } = useCheckIn();
  const [agreedTo, setAgreedTo] = useState(initialAgreementsState);
  const [hasConfirmedSubmission, setHasConfirmedSubmission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const hasAgreedToEverything = agreements.every(
    agreement => agreedTo[agreement.id],
  );
  const canSubmit = hasAgreedToEverything && hasConfirmedSubmission;

  const handleAgreementChange = id => e => {
    setAgreedTo(prev => ({ ...prev, [id]: e.target.checked }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (!checkInRecordId) {
        throw new Error('Missing check-in record ID.');
      }
      const updatedRecord = await acceptWaiver({ checkInRecordId });
      if (!updatedRecord) {
        throw new Error('Unable to save waiver acceptance.');
      }
      await syncGuestIntake({
        user,
        requiresWaiver: false,
      });
      await sendQRCode({ email: user.email, recordId: user.id });
      dispatch({ type: actions.SET_STAGE, stage: stages.CONFIRMATION });
    } catch (error) {
      logSentryError(error, {
        action: 'waiver-submit',
        checkInRecordId,
        userId: user?.id,
      });
      setSubmitError(
        'We could not save your waiver. Please try again or contact the event team.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action='#' className={styles.container} onSubmit={handleSubmit}>
      <header className={styles.header}>
        <p className={styles.intro}>
          Please review the information below and acknowledge each statement
          before signing.
        </p>
      </header>
      <div className={styles.textContainer}>
        <dl className={styles.eventDetails}>
          <div>
            <dt>Event</dt>
            <dd>
              Haliburton Highlands Music Festival Inc. OCN:1000601510 Operating
              as The Highlands Music Festival 2026 (the &ldquo;Event&rdquo;)
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>Camp Walden (the &ldquo;Event Location&rdquo;)</dd>
          </div>
          <div>
            <dt>Dates</dt>
            <dd>September 24-27, 2026</dd>
          </div>
        </dl>
        <p className={styles.notice}>
          <strong>
            ALCOHOL AND/OR CANNABIS MAY BE CONSUMED DURING THIS EVENT.
          </strong>
        </p>
        <section className={styles.legalSection}>
          <h3>Code of Conduct</h3>
          <p className={styles.text}>
            HIGHLANDS MUSIC FESTIVAL is committed to diversity and to providing
            a harassment-free Event experience for everyone. All attendees have
            the right to a safe and welcoming environment regardless of gender,
            gender identity and expression, age, sexual orientation, disability,
            physical appearance, body size, race, ethnicity, religion, or any
            other attributes. In addition to treating others respectfully,
            please do not bring items with disrespectful, malicious, or
            derogatory writing, images, or audio to the Event. All attendees
            must follow safety signage, instructions, and rules. If you have an
            experience that violates this code of conduct, visit the Office or
            find any Volunteer and ask for a manager.
          </p>
        </section>
        <section className={styles.legalSection}>
          <h3>Photo and Video Release</h3>
          <p className={styles.text}>
            I hereby grant Highlands Music Festival the right to photograph,
            videotape, and/or record me and to use my name, face, likeness,
            voice, and appearance in connection with exhibitions, publicity,
            advertising, and promotional materials without reservation or
            limitation.
          </p>
        </section>
        <section className={styles.legalSection}>
          <h3>Additional Vendor Waivers</h3>
          <p className={styles.text}>
            I acknowledge that while participating in the Event, I may engage in
            activities provided by third-party vendors. I understand that
            separate waivers may be required for these activities, and I assume
            all risks associated with such activities.
          </p>
        </section>
      </div>
      <div className={styles.agreementsContainer}>
        <div className={styles.sectionHeading}>
          <p>Required acknowledgements</p>
          <h3>Please confirm each statement</h3>
        </div>
        {agreements.map(agreement => (
          <div key={agreement.id} className={styles.agreementItem}>
            <p className={styles.agreementLabel}>{agreement.label}</p>
            <Checkbox
              id={agreement.id}
              label='YES'
              handleChange={handleAgreementChange(agreement.id)}
              required
            />
          </div>
        ))}
      </div>
      <p className={styles.warning}>
        IF YOU CANNOT CHECK &ldquo;YES&rdquo; TO ANY OF THE ABOVE, PLEASE
        DISCUSS THIS WAIVER WITH THE EVENT TEAM.
      </p>
      <div className={styles.signatureSection}>
        <div className={styles.sectionHeading}>
          <p>Final confirmation</p>
          <h3>Confirm your submission</h3>
        </div>
        <div className={styles.confirmationControl}>
          <Checkbox
            id='confirmWaiverSubmission'
            label='I confirm that my answers are accurate and I accept this waiver.'
            handleChange={e => setHasConfirmedSubmission(e.target.checked)}
            required
          />
        </div>
      </div>
      {submitError && <p className={styles.submitError}>{submitError}</p>}
      <Button
        classNames={styles.submitButton}
        isLoading={isSubmitting}
        isDisabled={!canSubmit}
      >
        Accept waiver
      </Button>
    </form>
  );
}
