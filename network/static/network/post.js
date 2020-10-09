document.addEventListener('DOMContentLoaded', function () {
  load_page('all_posts');
});

function post_form() {
  document.querySelector('#post-view').style.display = 'block';

  const post_button = document.querySelector('#post-button');
  const post_form = document.querySelector('#post-form');
  const post_close = document.querySelector('#post-close');
  const compose_form = document.querySelector('#compose-form');

  post_button.style.display = 'none';
  post_form.style.display = 'block';

  post_close.onclick = () => {
    post_form.style.display = 'none';
    post_button.style.display = 'block';
  }
  compose_form.onsubmit = () => post_network();
}


function load_page(page) {
  document.querySelector('#post-text').value = '';
  document.querySelector('#post-form').style.display = 'none';

  const post_button = document.querySelector('#post-button');
  const post_view = document.querySelector('#post-view');
  post_button.style.display = 'block';
  post_view.style.display = 'block';

  post_button.onclick = () => post_form();

  fetch(`/posts/${page}`)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(post => {
        const post_card = document.createElement('div');
        const post_user = document.createElement('div');
        const post_timestamp = document.createElement('div');
        const post_text = document.createElement('div');
        const post_likes = document.createElement('div');

        post_card.classList.add('col', 'shadow-lg', 'p-3', 'mb-5', 'bg-white', 'rounded');
        post_user.classList.add('row', 'mx-3', 'font-weight-bold');
        post_timestamp.classList.add('row', 'mx-3', 'text-secondary', 'small');
        post_text.classList.add('row', 'mx-3', 'my-2');
        post_likes.classList.add('row', 'mx-3', 'small');

        post_user.innerHTML = post.poster;
        post_timestamp.innerHTML = post.timestamp;
        post_text.innerHTML = post.text.replace(/\n/g, '<br>');
        post_likes.innerHTML = post.likes;

        post_card.appendChild(post_user);
        post_card.appendChild(post_timestamp);
        post_card.appendChild(post_text);
        post_card.appendChild(post_likes);
        post_view.appendChild(post_card);
      })
    })
}

function post_network() {
  const compose_form = document.querySelector('#compose-form');
  const post_text = compose_form.querySelector('#post-text');

  const csrftoken = getCookie('csrftoken');

  console.log(post_text.value);

  fetch('/posts', {
    headers: { 'X-CSRFToken': csrftoken },
    method: 'POST',
    body: JSON.stringify({
      post_text: post_text.value,
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      () => load_page('all_posts');
    })
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}