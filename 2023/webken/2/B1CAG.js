const input1 = document.querySelector("#num1");
const input2 = document.querySelector("#num2");
const operator = document.querySelector("#operator");
const calcButton = document.querySelector("#calc-btn");
const result = document.querySelector("#result");

const calc = (num1, num2, operator) => {
  switch (operator) {
    case "plus":
      return num1 + num2;
    case "minus":
      return num1 - num2;
    case "multiply":
      return num1 * num2;
    case "divide":
      return num1 / num2;
  }
};

calcButton.addEventListener("click", () => {
  const num1Str = input1.value;
  const num2Str = input2.value;
  const operatorStr = operator.value;
  const num1 = parseInt(num1Str);
  const num2 = parseInt(num2Str);
  result.textContent = calc(num1, num2, operatorStr);
});
