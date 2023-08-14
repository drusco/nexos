import Emulator from "./Emulator";
export { default } from "./Emulator";

const $ = new Emulator();

for (let i = 0; i < 1000000; i++) {
  const p = $.use();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  p();
  $.kill();
}
console.log("the end");
