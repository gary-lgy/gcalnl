const ansi = require("ansi-escapes");

console.log("one")
console.log("two")
console.log("three")

setTimeout(() => {
  process.stdout.write(ansi.cursorPrevLine);
  setTimeout(() => {

  process.stdout.write(ansi.cursorPrevLine);
  }, 1000)
}, 1000)
