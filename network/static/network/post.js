document.addEventListener('DOMContentLoaded', function () {
  load_page('all_posts');
});

function post_form() {
  document.querySelector('#post-button').style.display = 'none';
  document.querySelector('#post-view').style.display = 'block';

  const post_form = document.querySelector('#post-form');
  const post_close = document.querySelector('#post-close');
  const compose_form = document.querySelector('#compose-form');

  post_form.style.display = 'block';

  post_close.onclick = () => load_page('all_posts');
  compose_form.onsubmit = () => post_network();
}


function load_page(page) {
  document.querySelector('#post-form').style.display = 'none';
  document.querySelector('#post-view').style.display = 'block';

  document.querySelector('#post-text').value = '';

  const post_button = document.querySelector('#post-button');
  post_button.style.display = 'block';


  post_button.onclick = () => post_form();

  fetch(`/posts/${page}`)
    .then(response => response.json())
    .then(posts => {
      posts.forEach(

      )
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
    .then(
      () => load_page('all_posts')
    )
  // .then(response => response.json())
  // .then(result => {
  //   load_page('all_posts')
  // })
  return false;
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