import { InputLabel, MenuItem, Select } from '@mui/material';
import Button from '@/components/shared/button/button';
import { useCheckIn } from '@/context/check-in-context';
import styles from './form.module.scss';
import { checkIn } from '@/lib/airtable';
import { useUser } from '@/context/user-context';
import { useState } from 'react';
import { Textarea } from '@mui/joy';

const arrivalTimes = [
  '4PM - 7PM',
  '7PM - 10PM',
  '10PM - 11PM',
  '11PM - 12AM',
  'After midnight',
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
    });
    setIsFormSubmitting(false);
    dispatch({
      type: actions.SET_STAGE,
      stage: stages.SIGN_WAIVER,
    });
  };
  return (
    <form action="#" className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.formFieldContainer}>
        <InputLabel className={styles.inputLabel} id="day-label">
          What day do you plan to arrive?
        </InputLabel>
        <Select
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
