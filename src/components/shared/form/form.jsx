import Button from '@/components/shared/button/button';
import FormElement from './formElements';
import styles from './form.module.scss';
import clsx from 'clsx';

const Heading = ({ heading, text, TextElement }) => {
  if (!heading && !text && !TextElement) return null;

  return (
    <div className={styles.textContainer}>
      {heading && <h2 className={styles.title}>{heading}</h2>}
      {text && <p className={styles.description}>{text}</p>}
      {TextElement && <TextElement classNames={styles.description} />}
    </div>
  );
};

export default function Form({
  formConfig,
  handleSubmit = () => {},
  isLoading = false,
  formContainerClassNames = '',
  inputClassNames = '',
  dropdownClassNames = '',
  labelClassNames = '',
  inputContainerClassNames = '',
  errorClassNames = '',
  formError = '',
  formErrorClassNames = '',
  buttonClassNames = '',
  buttonText = 'Submit',
  heading,
  text,
  TextElement = null,
  footer = null,
  noValidate = false,
}) {
  const handleSubmitForm = event => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <>
      <Heading heading={heading} text={text} TextElement={TextElement} />
      <form
        action='#'
        className={clsx(styles.container, formContainerClassNames)}
        onSubmit={handleSubmitForm}
        noValidate={noValidate}
      >
        {formError && <p className={formErrorClassNames}>{formError}</p>}
        {formConfig.map((elementConfig, index) => (
          <FormElement
            key={elementConfig.id || `${index}-form-element`}
            {...elementConfig}
            inputClassNames={
              elementConfig.type === 'dropdown'
                ? dropdownClassNames
                : inputClassNames
            }
            labelClassNames={labelClassNames}
            inputContainerClassNames={inputContainerClassNames}
            errorClassNames={errorClassNames}
          />
        ))}
        {footer}
        <Button classNames={buttonClassNames} isLoading={isLoading}>
          {buttonText}
        </Button>
      </form>
    </>
  );
}
