document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('comicForm');
    const comicStrip = document.getElementById('comicStrip');
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      comicStrip.innerHTML = ''; // Clear previous comic strip
  
      // Retrieve all the text inputs for the panels
      const inputs = [...form.querySelectorAll('input[type="text"]')]
        .map(input => input.value.trim())
        .filter(value => value); // Filter out empty strings
  
      // Display loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.textContent = 'Generating your comic strip, please wait...';
      comicStrip.appendChild(loadingIndicator);
  
      // Generate and display each comic panel
      for (let i = 0; i < inputs.length; i++) {
        try {
          const imageBlob = await query({ "inputs": inputs[i] });
          const imageUrl = URL.createObjectURL(imageBlob);
          displayComicPanel(imageUrl, i + 1);
        } catch (error) {
          handleApiError(error, i + 1);
        }
      }
  
      // Remove loading indicator
      comicStrip.removeChild(loadingIndicator);
    });
  
    function displayComicPanel(imageUrl, index) {
      const panel = document.createElement('div');
      panel.className = 'comic-panel';
      panel.innerHTML = `<img src="${imageUrl}" alt="Comic panel ${index}" loading="lazy">`;
      comicStrip.appendChild(panel);
    }
  
    async function query(data) {
      const response = await fetch(
        "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
        {
          headers: {
            "Accept": "image/png",
            "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.blob();
    }
  
    function handleApiError(error, index) {
      const errorPanel = document.createElement('div');
      errorPanel.className = 'comic-panel error';
      errorPanel.textContent = `Error loading panel ${index}: ${error.message}`;
      comicStrip.appendChild(errorPanel);
    }
  });
  
  document.getElementById('downloadBtn').addEventListener('click', function() {
    // Use html2canvas to take a screenshot of the comicStrip div and get a canvas
    html2canvas(document.getElementById('comicStrip')).then(function(canvas) {
        // Create an image from the canvas
        let image = canvas.toDataURL('image/png');

        // Create a temporary link element
        let tmpLink = document.createElement('a');
        tmpLink.download = 'comic-strip.png'; // Set the download name
        tmpLink.href = image; // Attach the image data to the link

        // Temporarily add the link to the document and trigger the download
        document.body.appendChild(tmpLink);
        tmpLink.click();
        document.body.removeChild(tmpLink);
    });
});
