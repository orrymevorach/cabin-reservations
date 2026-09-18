import Form from '@/components/shared/form/form';
import { useCheckIn } from '@/context/check-in-context';
import styles from './form.module.scss';
import { checkIn } from '@/lib/airtable';
import { useState } from 'react';
import { useRouter } from 'next/router';

const arrivalTimesData = {
  Thursday: ['4PM - 8PM', '8PM - 10PM', '10PM - 12AM', 'After midnight'],
  Friday: [
    '9AM - 12PM',
    '12PM - 4PM',
    '4PM - 8PM',
    '8PM - 10PM',
    '10PM - 12AM',
  ],
};

const arrivalDays = ['Thursday', 'Friday', 'Saturday'];

export default function CheckInForm({ user, onCheckInCreated = () => {} }) {
  const { state, dispatch, actions, stages } = useCheckIn();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  // remove appended 2026
  const userId = user?.id || router.query.id?.split('_')[0];

  const clearError = fieldId => {
    setErrors(currentErrors => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  };

  const handleFieldChange = (actionType, fieldId) => value => {
    dispatch({ type: actionType, [fieldId]: value });
    clearError(fieldId);
  };

  const arrivalTimes = arrivalTimesData[state.arrivalDay];

  const formConfig = [
    {
      type: 'dropdown',
      id: 'arrivalDay',
      label: 'What day do you plan to arrive?',
      value: state.arrivalDay,
      options: arrivalDays,
      required: true,
      validationMessage: 'Please select an arrival day.',
      error: errors.arrivalDay,
      handleChange: handleFieldChange(actions.SET_ARRIVAL_DAY, 'arrivalDay'),
    },
    {
      type: 'dropdown',
      id: 'arrivalTime',
      label: 'What time do you plan to arrive?',
      value: state.arrivalTime,
      options: arrivalTimes,
      required: true,
      validationMessage: 'Please select an arrival time.',
      error: errors.arrivalTime,
      handleChange: handleFieldChange(actions.SET_ARRIVAL_TIME, 'arrivalTime'),
    },
    {
      type: 'text',
      id: 'city',
      label: 'What city are you coming from?',
      value: state.city,
      handleChange: handleFieldChange(actions.SET_CITY, 'city'),
    },
    {
      type: 'dropdown',
      id: 'electricVehicle',
      label: 'Are you driving an electric vehicle that needs charging?',
      value: state.electricVehicle,
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      required: true,
      validationMessage: 'Please provide an answer.',
      error: errors.electricVehicle,
      handleChange: handleFieldChange(
        actions.SET_ELECTRIC_VEHICLE,
        'electricVehicle',
      ),
    },
    {
      type: 'dropdown',
      id: 'departureTime',
      label: 'Do you plan to depart at any point before 9:00AM on Sunday?',
      value: state.departureTime,
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      required: true,
      validationMessage: 'Please answer the question.',
      error: errors.departureTime,
      handleChange: handleFieldChange(
        actions.SET_DEPARTURE_TIME,
        'departureTime',
      ),
    },
    {
      type: 'text',
      id: 'birthday',
      label: 'What is your birthday?',
      value: state.birthday,
      placeholder: 'MM/DD/YYYY',
      required: true,
      validationMessage: 'Please enter your birthday.',
      error: errors.birthday,
      mask: 'month/day/year',
      inputProps: {
        inputMode: 'numeric',
        lazy: false,
        blocks: {
          month: { mask: '00', placeholderChar: 'M' },
          day: { mask: '00', placeholderChar: 'D' },
          year: { mask: '0000', placeholderChar: 'Y' },
        },
      },
      handleChange: handleFieldChange(actions.SET_BIRTHDAY, 'birthday'),
    },
    {
      type: 'text',
      id: 'howDidYouHearAboutHighlands',
      label: 'How did you hear about Highlands?',
      value: state.howDidYouHearAboutHighlands,
      placeholder: 'i.e. Friends, Family',
      handleChange: handleFieldChange(
        actions.HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS,
        'howDidYouHearAboutHighlands',
      ),
    },
  ];

  const handleSubmit = async () => {
    const newErrors = {};
    formConfig.forEach(({ id, value, required, validationMessage }) => {
      if (required && !value) {
        newErrors[id] = validationMessage;
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setIsFormSubmitting(true);
    const { alreadyCheckedIn, user: checkInRecord } = await checkIn({
      attendee: userId,
      arrivalDay: state.arrivalDay,
      arrivalTime: state.arrivalTime,
      city: state.city,
      birthday: state.birthday,
      howDidYouHearAboutHighlands: state.howDidYouHearAboutHighlands,
      electricVehicle: state.electricVehicle,
      departureTime: state.departureTime,
    });
    if (alreadyCheckedIn) {
      dispatch({ type: actions.SET_STAGE, stage: stages.CONFIRMATION });
      setIsFormSubmitting(false);
      return;
    }
    onCheckInCreated(checkInRecord.id);
    dispatch({
      type: actions.SET_STAGE,
      stage: stages.SIGN_WAIVER,
    });
    setIsFormSubmitting(false);
  };

  return (
    <Form
      formConfig={formConfig}
      handleSubmit={handleSubmit}
      isLoading={isFormSubmitting}
      formContainerClassNames={styles.container}
      inputClassNames={styles.input}
      dropdownClassNames={styles.dropdown}
      labelClassNames={styles.inputLabel}
      inputContainerClassNames={styles.formFieldContainer}
      errorClassNames={styles.fieldError}
      formError={
        Object.keys(errors).length > 0
          ? 'Please fill out all required fields below.'
          : ''
      }
      formErrorClassNames={styles.formError}
      buttonClassNames={styles.submitButton}
      buttonText='Continue to waiver'
      noValidate
      footer={
        <p className={styles.footer}>
          If you have any questions, feel free to reach out to{' '}
          <a
            href='mailto:info@highlandsmusicfestival.ca'
            className={styles.link}
          >
            info@highlandsmusicfestival.ca
          </a>
        </p>
      }
    />
  );
}
