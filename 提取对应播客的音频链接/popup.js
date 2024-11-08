document.addEventListener("DOMContentLoaded", function() {
  const extractButton = document.getElementById('extract-button');
  const resultContainer = document.getElementById('result-container');
  const statusMessage = document.getElementById('status-message');
  const languageSelect = document.getElementById('language-select');
  let userLanguage = 'zh';
  
  const messages = {
    zh: {
      extract: "提取",
      extracting: "提取中...",
      prompt: "请点击“提取”按钮开始提取对应的音频链接。",
      complete: "提取完成。",
      copied: "复制成功"
    },
    en: {
      extract: "Extract",
      extracting: "Extracting...",
      prompt: "Please click 'Extract' to start extracting audio source links.",
      complete: "Extraction completed.",
      copied: "Copied successfully"
    }
  };

  languageSelect.addEventListener('change', () => {
    userLanguage = languageSelect.value;
    updateText();
  });

  function updateText() {
    extractButton.textContent = messages[userLanguage].extract;
    statusMessage.textContent = messages[userLanguage].prompt;
  }

  extractButton.addEventListener('click', () => {
    extractButton.disabled = true;
    statusMessage.textContent = messages[userLanguage].extracting;
    resultContainer.textContent = '';

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: extractAudioSrc
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const audioSrc = results[0].result;
          const linkElement = document.createElement('div');
          linkElement.textContent = audioSrc;
          const copyButton = document.createElement('button');
          copyButton.textContent = 'Copy';
          copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(audioSrc).then(() => {
              showCopySuccessMessage();
            });
          });
          linkElement.appendChild(copyButton);
          resultContainer.appendChild(linkElement);
        } else {
          resultContainer.textContent = userLanguage === 'zh' ? '未找到音频源。' : 'No audio source found.';
        }
        statusMessage.textContent = messages[userLanguage].complete;
        extractButton.disabled = false;
      });
    });
  });

  function extractAudioSrc() {
    const audioElement = document.querySelector("#__next > section > audio");
    return audioElement ? audioElement.src : null;
  }

  function showCopySuccessMessage() {
    const message = document.createElement('div');
    message.textContent = messages[userLanguage].copied;
    message.style.position = 'fixed';
    message.style.bottom = '10px';
    message.style.right = '10px';
    message.style.backgroundColor = '#4CAF50';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    document.body.appendChild(message);

    setTimeout(() => {
      document.body.removeChild(message);
    }, 3000);
  }

  updateText();
});
