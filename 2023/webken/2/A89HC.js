const input1 = document.querySelector("#num1");
const input2 = document.querySelector("#num2");
const calcButton = document.querySelector("#calc-btn");
const result = document.querySelector("#result");

calcButton.addEventListener("click", () => {
  const num1Str = input1.value;
  const num2Str = input2.value;
  const num1 = parseInt(num1Str);
  const num2 = parseInt(num2Str);
  result.textContent = num1 + num2;
});
