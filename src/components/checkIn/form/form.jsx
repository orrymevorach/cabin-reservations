import { InputLabel, MenuItem, Select } from '@mui/material';
import Button from '@/components/shared/button/button';
import { useCheckIn } from '@/context/check-in-context';
import styles from './form.module.scss';
import { checkIn } from '@/lib/airtable';
import { useState } from 'react';
import { Textarea } from '@mui/joy';
import Input from '@/components/shared/input/input';
import { useRouter } from 'next/router';

const arrivalTimesThursday = [
  '4PM - 8PM',
  '8PM - 10PM',
  '10PM - 12AM',
  'After midnight',
];

const arrivalTimesFriday = [
  '9AM - 12PM',
  '12PM - 4PM',
  '4PM - 8PM',
  '8PM - 10PM',
  '10PM - 12AM',
];

const arrivalDays = ['Thursday', 'Friday', 'Saturday'];

export default function CheckInForm() {
  const { state, dispatch, actions, stages } = useCheckIn();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const router = useRouter();
  const userId = router.query.id;

  const handleSubmit = async e => {
    e.preventDefault();
    setIsFormSubmitting(true);
    await checkIn({
      attendee: userId,
      arrivalDay: state.arrivalDay,
      arrivalTime: state.arrivalTime,
      city: state.city,
      birthday: state.birthday,
      howDidYouHearAboutHighlands: state.howDidYouHearAboutHighlands,
      electricVehicle: state.electricVehicle,
      departureTime: state.departureTime,
    });
    setIsFormSubmitting(false);
    dispatch({
      type: actions.SET_STAGE,
      stage: stages.SIGN_WAIVER,
    });
  };

  const arrivalTimes =
    state.arrivalDay === 'Thursday' ? arrivalTimesThursday : arrivalTimesFriday;

  return (
    <form action="#" className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="day-label">
          What day do you plan to arrive?
        </InputLabel>
        <Select
          required
          labelId="day-label"
          id="day"
          value={state.arrivalDay}
          className={styles.dropdown}
          onChange={e =>
            dispatch({
              type: actions.SET_ARRIVAL_DAY,
              arrivalDay: e.target.value,
            })
          }
        >
          {arrivalDays.map(day => {
            return (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="time-label">
          What time do you plan to arrive?
        </InputLabel>
        <Select
          required
          labelId="time-label"
          id="time"
          value={state.arrivalTime}
          className={styles.dropdown}
          onChange={e =>
            dispatch({
              type: actions.SET_ARRIVAL_TIME,
              arrivalTime: e.target.value,
            })
          }
        >
          {arrivalTimes.map(time => {
            return (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="city-label">
          What city are you coming from?
        </InputLabel>
        <Input
          value={state.city}
          handleChange={e =>
            dispatch({ type: actions.SET_CITY, city: e.target.value })
          }
          classNames={styles.input}
        />
      </div>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="time-label">
          Are you driving an electric vehicle that needs charging?
        </InputLabel>
        <Select
          required
          labelId="electric-vehicle"
          id="electricVehicle"
          value={state.electricVehicle}
          className={styles.dropdown}
          onChange={e =>
            dispatch({
              type: actions.SET_ELECTRIC_VEHICLE,
              electricVehicle: e.target.value,
            })
          }
        >
          <MenuItem value={'yes'}>Yes</MenuItem>
          <MenuItem value={'no'}>No</MenuItem>
        </Select>
      </div>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="time-label">
          Do you plan to depart at any point before 9:00AM on Sunday?
        </InputLabel>
        <Select
          required
          labelId="depart-label"
          id="departureTime"
          value={state.departureTime}
          className={styles.dropdown}
          onChange={e =>
            dispatch({
              type: actions.SET_DEPARTURE_TIME,
              departureTime: e.target.value,
            })
          }
        >
          <MenuItem value={'yes'}>Yes</MenuItem>
          <MenuItem value={'no'}>No</MenuItem>
        </Select>
      </div>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="birthday-label">
          What is your birthday?
        </InputLabel>
        <Input
          handleChange={e =>
            dispatch({ type: actions.SET_BIRTHDAY, birthday: e.target.value })
          }
          placeholder="MM/DD/YYYY"
          value={state.birthday}
          classNames={styles.input}
          required
        />
      </div>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="time-label">
          How did you hear about Highlands?
        </InputLabel>
        <Textarea
          value={state.howDidYouHearAboutHighlands}
          onChange={e =>
            dispatch({
              type: actions.HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS,
              howDidYouHearAboutHighlands: e.target.value,
            })
          }
          minRows={1}
        />
      </div>
      <p>
        If you have any questions, feel free to reach out to
        info@highlandsmusicfestival.ca
      </p>
      <Button classNames={styles.submitButton} isLoading={isFormSubmitting}>
        Continue
      </Button>
    </form>
  );
}
