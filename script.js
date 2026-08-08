// Welcome Message
window.onload = function () {
    console.log("Welcome to Suman Official");
};

// Hire Me Button
const hireBtn = document.querySelector("button");

if (hireBtn) {
    hireBtn.addEventListener("click", function () {
        alert("Thank you for visiting Suman Official!");
    });
}