export function replaceCamelCaseWithSpaces(string) {
  const regex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;
  return string.replace(regex, '$1$4 $2$3$5');
}

export function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function isObjectEmpty(obj) {
  // If obj is null, undefined, or not an object, consider it "empty"
  if (!obj || typeof obj !== 'object') return true;
  return Object.keys(obj).length === 0;
}

export function generateRandomPassword(length = 12) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:"<>?|[];,./~`-=\\';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return `hmf_${password}`;
}
