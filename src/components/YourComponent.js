// src/components/YourComponent.js
import { validateEmail, validatePassword, validateCourseData } from '../utils/validators';

const handleSubmit = (data) => {
  // Validate email
  if (!validateEmail(data.email)) {
    setErrors({ email: 'Invalid email address' });
    return;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    setErrors({ password: passwordValidation.errors[0] });
    return;
  }

  // Validate course data
  const courseValidation = validateCourseData(data);
  if (!courseValidation.isValid) {
    setErrors(courseValidation.errors);
    return;
  }

  // Submit data...
};
