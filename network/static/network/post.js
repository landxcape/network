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
      console.log(posts);
      const post_card_template = document.querySelector('#post-card-template');
      posts.forEach(post => {
        var clone_post_card = post_card_template.cloneNode(true);

        var clone_post_user = clone_post_card.querySelector('#post-user');
        var clone_post_timestamp = clone_post_card.querySelector('#post-timestamp');
        var clone_post_text = clone_post_card.querySelector('#post-text');
        var clone_post_likes = clone_post_card.querySelector('#post-likes');
        var clone_post_comments = clone_post_card.querySelector('#post-comments');
        var clone_post_comment_form = clone_post_card.querySelector('#comment-form');
        var clone_post_all_comments = clone_post_card.querySelector('#post-all-comments');

        clone_post_user.innerHTML = post.poster;
        clone_post_timestamp.innerHTML = post.timestamp;
        clone_post_text.innerHTML = post.text.replace(/\n/g, '<br>');
        clone_post_likes.innerHTML = post.check_liked ? `Unlike ${post.likes}` : `Like ${post.likes}`;
        clone_post_comments.innerHTML = `Comments ${post.comments}`;

        post_view.appendChild(clone_post_card);

        const csrftoken = getCookie('csrftoken');

        clone_post_likes.onclick = () => {
          fetch(`/posts/${post.id}`, {
            headers: { 'X-CSRFToken': csrftoken },
            method: 'PUT',
            body: JSON.stringify({
              like: !post.check_liked
            })
          })
            .then(response => response.json())
            .then(result => {
              post.check_liked = result.check_liked;
              post.likes = result.likes;
              clone_post_likes.innerHTML = result.check_liked ? `Unlike ${post.likes}` : `Like ${post.likes}`;
            })
        }

        clone_post_user.onclick = () => {
          fetch(`/profile/${post.poster}`)
            .then(response => response.json())
            .then(profile => {
              console.log(profile);
            })
        }

        clone_post_comments.onclick = () => {
          if (clone_post_comment_form.style.display === 'none') {
            clone_post_comments.classList.add('shadow-sm');
            clone_post_comment_form.style.display = 'block';

            fetch(`/posts/${post.id}`)
              .then(response => response.json())
              .then(post_contents => {
                console.log(post_contents);
                post_contents.comments.coforEach(comment => {
                  var comment_row = clone_post_all_comments.querySelector('div');

                  comment_row.innerHTML = comment;
                  clone_post_all_comments.appendChild(comment_row);
                })
                comment_row.parentNode.removeChild(comment_row);
              })
          }
          else {
            clone_post_comments.classList.remove('shadow-sm');
            clone_post_comment_form.style.display = 'none';
          }
        }
      })
      post_card_template.parentNode.removeChild(post_card_template);
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

function load_profile(username) {

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