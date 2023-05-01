const input1 = document.querySelector("#num1");
const input2 = document.querySelector("#num2");
const operator = document.querySelector("#operator");
const calcButton = document.querySelector("#calc-btn");
const result = document.querySelector("#result");
const error = document.querySelector("#error");

const calc = (num1, num2, operator) => {
  switch (operator) {
    case "plus":
      return num1 + num2;
    case "minus":
      return num1 - num2;
    case "multiply":
      return num1 * num2;
    case "divide":
      if (num2 === 0) {
        error.textContent = "0で割ることはできません";
        return;
      }
      return num1 / num2;
  }
};

calcButton.addEventListener("click", () => {
  const num1Str = input1.value;
  const num2Str = input2.value;
  const num1 = parseInt(num1Str);
  const num2 = parseInt(num2Str);
  if (isNaN(num1) || isNaN(num2)) {
    error.textContent = "数値を入力してください";
    return;
  }
  error.textContent = "";
  result.textContent = calc(num1, num2, operator.value);
});
