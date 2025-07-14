


// array object where each object has test and category
let quotes = [
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  ];

document.addEventListener("DOMContentLoaded", () => {
    // Show random initial quote
    showRandomQuote() 

    
})

const showRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    document.getElementById("quoteDisplay").innerText = randomQuote.text;
}

const buttonNewQoute = document.getElementById("Button-newQuote")
const handleClickNewQoute = () => {
    console.log("Button was clicked")
    
} 