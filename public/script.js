const fileInput = document.getElementById('votFile');
const uploadForm = document.getElementById('uploadForm');
const message = document.getElementById('message');
const selectedFileName = document.getElementById('selectedFileName');
const resultsDiv = document.getElementById('results');
const positiveCount = document.getElementById('positiveCount');
const neutralCount = document.getElementById('neutralCount');
const negativeCount = document.getElementById('negativeCount');

// Store full processed data here
let fullDataWithSentiment = [];

// Toast function
function showToast(messageText) {
  const toast = document.getElementById('toast');
  toast.innerText = messageText;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Show selected file name
fileInput.addEventListener('change', function () {
  if (fileInput.files.length > 0) {
    selectedFileName.innerText = `Selected file: ${fileInput.files[0].name}`;
  } else {
    selectedFileName.innerText = '';
  }
});

// Handle Upload
uploadForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (fileInput.files.length === 0) {
    message.innerText = "Please select a file first!";
    message.style.color = "red";
    return;
  }

  const formData = new FormData();
  formData.append('votFile', fileInput.files[0]);

  try {
    message.innerText = "";

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      message.innerText = "File uploaded and parsed successfully!";
      message.style.color = "#28a745";

      showToast("✅ File uploaded!");

      // Full analysis flow
      await runAllAnalyses(result.dataPreview);

      // ❌ Do NOT show sentiment summary yet
      // ❌ Do NOT unhide resultsDiv yet

    } else {
      message.innerText = "Upload failed.";
      message.style.color = "red";
    }
  } catch (error) {
    console.error('Error:', error);
    message.innerText = "Something went wrong!";
    message.style.color = "red";
  }
});

// --- Analysis Controller ---

async function runAllAnalyses(dataPreview) {
  fullDataWithSentiment.length = 0; // Clear old

  // Run Sentiment Analysis
  analyzeSentiment(dataPreview);

  // Future: Run other analyses here
  // analyzeToxicity(dataPreview);
  // analyzeCategories(dataPreview);

  // ❌ Don't show results now
  // ✅ Just prepare data silently
}

// Sentiment Analysis (internal)
function analyzeSentiment(dataPreview) {
  dataPreview.forEach(row => {
    const text = row.comment || row.feedback || row.text || ""; // Adjust column names
    let sentiment = "Neutral"; // Default

    const lowerText = text.toLowerCase();

    if (lowerText.includes("good") || lowerText.includes("great") || lowerText.includes("love") || lowerText.includes("amazing")) {
      sentiment = "Positive";
    } else if (lowerText.includes("bad") || lowerText.includes("hate") || lowerText.includes("terrible") || lowerText.includes("poor")) {
      sentiment = "Negative";
    }

    const newRow = { ...row, sentiment: sentiment };
    fullDataWithSentiment.push(newRow);
  });
}

// ONLY when future full analyses are done, later call this
function updateSentimentSummary() {
  let positive = 0;
  let neutral = 0;
  let negative = 0;

  fullDataWithSentiment.forEach(row => {
    if (row.sentiment === "Positive") positive++;
    else if (row.sentiment === "Negative") negative++;
    else neutral++;
  });

  positiveCount.innerText = `✅ Positive: ${positive}`;
  neutralCount.innerText = `➖ Neutral: ${neutral}`;
  negativeCount.innerText = `❌ Negative: ${negative}`;

  resultsDiv.classList.remove('hidden'); // Then and only then show
}
