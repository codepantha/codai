// import assets
import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('.chat-container');

let loadInterval;
const loader = (element) => {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') element.textContent = '';
  }, 300);
};

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
};

const chatStripe = (isAi, value, uniqueId) => {
  return `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  `;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  // user stripe
  chatContainer.innerHTML += chatStripe(
    false,
    formData.get('prompt'),
    generateUniqueId()
  );

  // bot stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);

  // scroll the to top of the new chat message
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Get data from server
  const response = await fetch('https://codai-4fws.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: formData.get('prompt')
    })
  });

  // clear the interval to stop the loading
  clearInterval(loadInterval);
  // empty the messageDiv container
  messageDiv.innerText = '';

  if (!response.ok) {
    const err = await response.text();
    messageDiv.innerText = 'Something bad happened...';
    alert(err);
    return;
  }

  form.reset();

  const data = await response.json();
  const parsedData = data.bot.trim();

  typeText(messageDiv, parsedData);
  
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') handleSubmit(e);
});

window.addEventListener('load', async () => {
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);

  const response = await fetch('https://codai-4fws.onrender.com/');
  const data = await response.json();

  const messageDiv = document.getElementById(uniqueId);
  typeText(messageDiv, data.message);
})
