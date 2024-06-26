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
