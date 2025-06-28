// Global quotes array to store all quotes
let quotes = [];

// Track the currently selected category
let selectedCategory = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load quotes from local storage on startup
    loadQuotes();
    
    // Populate categories dropdown
    populateCategories();
    
    // Restore previously selected category from local storage
    restoreSelectedCategory();
    
    // Show initial random quote
    showRandomQuote();
    
    // Create the add quote form dynamically
    createAddQuoteForm();
});

// Function to save and restore selected category
function saveSelectedCategory() {
    // Store the selected category in local storage
    localStorage.setItem('selectedCategory', selectedCategory);
}

function restoreSelectedCategory() {
    // Retrieve the previously selected category
    const storedCategory = localStorage.getItem('selectedCategory');
    
    if (storedCategory) {
        // Set the dropdown to the stored category
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.value = storedCategory;
        
        // Update the global selectedCategory
        selectedCategory = storedCategory;
    }
}

// Function to load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none exist
        quotes = [
            { text: "Believe you can and you're halfway there.", category: "Motivation" },
            { text: "The only way to do great work is to love what you do.", category: "Work" }
        ];
        saveQuotes();
    }
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories(); // Update categories after saving
}

// Dynamically create the add quote form
function createAddQuoteForm() {
    // Ensure we have a container for the form
    let formContainer = document.querySelector('.quote-form');
    if (!formContainer) {
        formContainer = document.createElement('div');
        formContainer.classList.add('quote-form');
        document.querySelector('.container').appendChild(formContainer);
    }

    // Create form HTML dynamically
    formContainer.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button id="addQuoteButton">Add Quote</button>
    `;

    // Add event listener for adding quotes
    document.getElementById('addQuoteButton').addEventListener('click', addQuote);
}

// Show a random quote, optionally filtered by category
function showRandomQuote() {
    const categoryFilter = document.getElementById('categoryFilter');
    selectedCategory = categoryFilter.value;
    
    // Save the selected category
    saveSelectedCategory();

    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length > 0) {
        const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `
            <blockquote>
                <p>"${randomQuote.text}"</p>
                <cite>- ${randomQuote.category}</cite>
            </blockquote>
        `;
    } else {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = '<p>No quotes found in this category!</p>';
    }
}

// Add a new quote dynamically
function addQuote() {
    // Get input elements
    const quoteTextInput = document.getElementById('newQuoteText');
    const quoteCategoryInput = document.getElementById('newQuoteCategory');

    // Extract values
    const quoteText = quoteTextInput.value.trim();
    const quoteCategory = quoteCategoryInput.value.trim();

    // Validate input
    if (quoteText && quoteCategory) {
        // Add new quote to quotes array
        quotes.push({ 
            text: quoteText, 
            category: quoteCategory 
        });
        
        // Save to local storage
        saveQuotes();
        
        // Clear input fields
        quoteTextInput.value = '';
        quoteCategoryInput.value = '';
        
        // Refresh quote display
        showRandomQuote();
    } else {
        alert('Please enter both quote text and category');
    }
}

// Dynamically populate category dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Extract unique categories
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    // Clear existing options except 'All Categories'
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }

    // Add new categories
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the previously selected category
    if (selectedCategory !== 'all') {
        categoryFilter.value = selectedCategory;
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    // Update selected category and show random quote
    showRandomQuote();
}

// Export quotes to JSON file
function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            // Validate imported quotes
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                showRandomQuote();
                alert('Quotes imported successfully!');
            } else {
                throw new Error('Invalid JSON format');
            }
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// [All previous existing code remains UNCHANGED]

// New async function for fetching quotes from server
async function fetchQuotesFromServer() {
    // Define server endpoints to fetch quotes from
    const serverEndpoints = [
        'https://jsonplaceholder.typicode.com/posts',
        'https://jsonplaceholder.typicode.com/comments'
    ];

    try {
        // Use Promise.all with await to fetch from multiple endpoints concurrently
        const fetchedDataSets = await Promise.all(
            serverEndpoints.map(async (endpoint) => {
                try {
                    // Await the fetch and parse JSON
                    const response = await fetch(endpoint);
                    
                    // Check if the response is successful
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // Parse the JSON data
                    const data = await response.json();
                    
                    // Transform server data into quote format
                    return data.slice(0, 5).map(item => ({
                        text: item.body || item.name, // Use body or name as quote text
                        category: 'Server Import' // Static category for imported quotes
                    }));
                } catch (error) {
                    // Log individual endpoint errors
                    console.error(`Error fetching from ${endpoint}:`, error);
                    return []; // Return empty array to prevent overall failure
                }
            })
        );

        // Flatten the array of quote sets
        const newQuotes = fetchedDataSets.flat();
        
        // Add fetched quotes to existing quotes
        if (newQuotes.length > 0) {
            quotes.push(...newQuotes);
            
            // Save updated quotes
            saveQuotes();
            
            // Refresh the quote display and categories
            populateCategories();
            showRandomQuote();
        }
    } catch (error) {
        // Handle any unexpected errors in the overall process
        console.error('Failed to fetch quotes from servers:', error);
    }
}

// Global variables for server synchronization
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 60000; // 1 minute sync interval
let lastSyncTimestamp = 0;
let syncConflicts = [];

// Enhanced server synchronization function
async function syncQuotes() {
    try {
        // Fetch current server data
        const response = await fetch(SERVER_URL);
        if (!response.ok) {
            throw new Error('Server sync failed');
        }
        const serverQuotes = await response.json();

        // Transform server data to quote format
        const transformedServerQuotes = serverQuotes.slice(0, 10).map(post => ({
            id: post.id,
            text: post.title,
            category: 'Server Import',
            timestamp: Date.now()
        }));

        // Conflict resolution logic
        const resolvedQuotes = resolveQuoteConflicts(quotes, transformedServerQuotes);

        // Update local quotes
        quotes = resolvedQuotes;

        // Save and refresh
        saveQuotes();
        populateCategories();
        showRandomQuote();

        // Update sync tracking
        lastSyncTimestamp = Date.now();

        // Display success notification
        displaySyncNotification('Quotes synced with server!'); // Add this line
    } catch (error) {
        console.error('Sync error:', error);
        displaySyncNotification('Sync failed. Please check your connection.', 'error');
    }
}

// Conflict resolution strategy
function resolveQuoteConflicts(localQuotes, serverQuotes) {
    // Clear previous conflicts
    syncConflicts = [];

    // Create maps for efficient lookup
    const localQuoteMap = new Map(localQuotes.map(q => [q.id, q]));
    const serverQuoteMap = new Map(serverQuotes.map(q => [q.id, q]));

    // Merge quotes with server precedence
    const mergedQuotes = [...localQuotes];

    serverQuotes.forEach(serverQuote => {
        const existingLocalQuote = localQuoteMap.get(serverQuote.id);

        if (!existingLocalQuote) {
            // New quote from server
            mergedQuotes.push(serverQuote);
        } else if (serverQuote.timestamp > existingLocalQuote.timestamp) {
            // Server quote is newer - record conflict and replace
            syncConflicts.push({
                local: existingLocalQuote,
                server: serverQuote
            });

            // Replace local quote with server quote
            const index = mergedQuotes.indexOf(existingLocalQuote);
            mergedQuotes[index] = serverQuote;
        }
    });

    return mergedQuotes;
}

// Create a UI notification for sync events
function displaySyncNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notificationContainer = document.getElementById('syncNotification');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'syncNotification';
        notificationContainer.classList.add('sync-notification');
        document.querySelector('.container').prepend(notificationContainer);
    }

    // Set notification content and style
    notificationContainer.textContent = message;
    notificationContainer.className = `sync-notification ${type}`;

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notificationContainer.textContent = '';
    }, 3000);
}

// Manual conflict resolution
function showConflictResolutionModal() {
    if (syncConflicts.length === 0) {
        alert('No conflicts to resolve');
        return;
    }

    const modalContent = syncConflicts.map(conflict => `
        <div class="conflict-item">
            <h3>Conflict Detected</h3>
            <div>
                <strong>Local Quote:</strong> ${conflict.local.text}
                <strong>Server Quote:</strong> ${conflict.server.text}
            </div>
            <button onclick="keepLocalQuote(${conflict.local.id})">Keep Local</button>
            <button onclick="keepServerQuote(${conflict.server.id})">Keep Server</button>
        </div>
    `).join('');

    // Create or update conflict resolution modal
    let modal = document.getElementById('conflictModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'conflictModal';
        modal.className = 'conflict-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = modalContent;
    modal.style.display = 'block';
}

// Conflict resolution handlers
function keepLocalQuote(id) {
    // Logic to keep local quote
    syncConflicts = syncConflicts.filter(conflict => conflict.local.id !== id);
    closeConflictModal();
}

function keepServerQuote(id) {
    // Logic to keep server quote
    const conflictIndex = syncConflicts.findIndex(conflict => conflict.server.id === id);
    if (conflictIndex !== -1) {
        const serverQuote = syncConflicts[conflictIndex].server;
        
        // Replace quote in main quotes array
        const quoteIndex = quotes.findIndex(q => q.id === id);
        if (quoteIndex !== -1) {
            quotes[quoteIndex] = serverQuote;
            saveQuotes();
        }

        syncConflicts.splice(conflictIndex, 1);
    }
    
    closeConflictModal();
}

function closeConflictModal() {
    const modal = document.getElementById('conflictModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize periodic synchronization
function initServerSync() {
    // Initial sync
    syncQuotes();

    // Periodic sync
    setInterval(syncQuotes, SYNC_INTERVAL);
}

// Modify DOMContentLoaded to include server sync
document.addEventListener('DOMContentLoaded', () => {
    // Previous initialization code...
    
    // Add server sync initialization
    initServerSync();
});

async function postQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quote)
        });

        if (!response.ok) {
            throw new Error(`Failed to post quote: ${response.statusText}`);
        }

        console.log(`Quote posted successfully:`, await response.json());
    } catch (error) {
        console.error('Error posting quote:', error);
    }
}