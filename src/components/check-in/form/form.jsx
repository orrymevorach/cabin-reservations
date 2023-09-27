import { InputLabel, MenuItem, Select } from '@mui/material';
import Button from '@/components/shared/button/button';
import { useCheckIn } from '@/context/check-in-context';
import styles from './form.module.scss';
import { checkIn } from '@/lib/airtable';
import { useUser } from '@/context/user-context';
import { useState } from 'react';
import { Textarea } from '@mui/joy';
import Input from '@/components/shared/input/input';

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
  const { user } = useUser();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsFormSubmitting(true);
    await checkIn({
      id: user.id,
      name: user.name,
      arrivalDay: state.arrivalDay,
      arrivalTime: state.arrivalTime,
      questions: state.questions,
      city: state.city,
      birthday: state.birthday,
      howDidYouHearAboutHighlands: state.howDidYouHearAboutHighlands,
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
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="time-label">
          Do you have any questions for us? Or are you just straight up psyched
          to get here?
        </InputLabel>
        <Textarea
          value={state.questions}
          onChange={e =>
            dispatch({ type: actions.SET_QUESTIONS, questions: e.target.value })
          }
          minRows={3}
        />
      </div>
      <Button classNames={styles.submitButton} isLoading={isFormSubmitting}>
        Continue
      </Button>
    </form>
  );
}
