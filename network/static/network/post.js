document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#username').addEventListener('click', () => load_profile({ 'username': document.querySelector('#username').querySelector('strong').innerHTML }));
  document.querySelector('#posts-following').addEventListener('click', () => load_page('posts_following'));

  load_page('all_posts');
});

function post_form() {
  document.querySelector('#post-view').style.display = 'block';
  document.querySelector('#profile-view').style.display = 'none';

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
  document.querySelector('#profile-view').style.display = 'none';


  const post_button = document.querySelector('#post-button');
  post_button.style.display = 'block';
  const post_view = document.querySelector('#post-view');
  post_view.style.display = 'block';

  post_button.onclick = () => post_form();

  show_posts(page, post_view);
}

function post_network() {
  const compose_form = document.querySelector('#compose-form');
  const post_text = compose_form.querySelector('#post-text');

  const csrftoken = getCookie('csrftoken');


  fetch('/posts', {
    headers: { 'X-CSRFToken': csrftoken },
    method: 'POST',
    body: JSON.stringify({
      post_text: post_text.value,
    })
  })
    .then(response => response.json())
    .then(result => {
      () => load_page('all_posts');
    })
}

function update_count(username) {
  const csrftoken = getCookie('csrftoken');

  fetch(`/profile/${username}`, {
    headers: { 'X-CSRFToken': csrftoken },
    method: 'POST',
    body: JSON.stringify({
      "get_counts": username
    })
  })
    .then(response => response.json())
    .then(counts => {
      document.querySelector('#profile-posts').querySelector('strong').innerHTML = `Posts (${counts.posts_count})`;
      document.querySelector('#profile-followers').querySelector('strong').innerHTML = `Followers (${counts.followers_count})`;
      document.querySelector('#profile-following').querySelector('strong').innerHTML = `Following (${counts.following_count})`;
    })
}

function load_profile(profile) {
  document.querySelector('#post-button').style.display = 'none';
  document.querySelector('#post-form').style.display = 'none';
  document.querySelector('#post-view').style.display = 'none';

  const profile_view = document.querySelector('#profile-view');
  const profile_username = document.querySelector('#profile-username');
  const profile_posts = document.querySelector('#profile-posts');
  const profile_followers = document.querySelector('#profile-followers');
  const profile_following = document.querySelector('#profile-following');

  profile_view.style.display = 'block';
  profile_username.querySelector('h1').innerHTML = profile.username;

  const csrftoken = getCookie('csrftoken');


  try {
    profile_view.removeChild(document.querySelector('#profile-container'))
  } catch (error) { }


  update_count(profile.username);

  if (profile.username !== document.querySelector('#username').querySelector('strong').innerHTML) {
    var follow_bar_button = profile_view.querySelector('#profile-follow-button');
    if (follow_bar_button === null) {
      follow_bar_button = document.createElement('button');
    }


    follow_bar_button.id = 'profile-follow-button';
    follow_bar_button.classList.add('btn', 'btn-outline-primary', 'btn-block');

    fetch(`/profile/${profile.username}`, {
      headers: { 'X-CSRFToken': csrftoken },
      method: 'POST',
      body: JSON.stringify({
        "follow_check": profile.username
      })
    })
      .then(response => response.json())
      .then(message => {

        if (message.follow_check) {
          follow_bar_button.innerHTML = 'Unfollow -';
        } else {
          follow_bar_button.innerHTML = 'Follow +';
        }
      })

    follow_bar_button.onclick = () => {
      fetch(`/profile/${profile.username}`, {
        headers: { 'X-CSRFToken': csrftoken },
        method: 'POST',
        body: JSON.stringify({
          "follow": profile.username
        })
      })
        .then(response => response.json())
        .then(message => {
          update_count(profile.username);

          try {
            profile_view.removeChild(document.querySelector('#profile-container'))
          } catch (error) { }

          if (message.follow_check) {
            follow_bar_button.innerHTML = 'Unfollow -';
          } else {
            follow_bar_button.innerHTML = 'Follow +';
          }

        })
      return false;
    }
    document.querySelector('#profile-follow-div').appendChild(follow_bar_button);
  } else {
    try {
      document.querySelector('#profile-follow-div').removeChild(document.querySelector('#profile-follow-button'));
    } catch (error) { }
  }

  profile_posts.onclick = () => {
    try {
      profile_view.removeChild(document.querySelector('#profile-container'))
    } catch (error) { }

    const profile_container = document.createElement('div');
    profile_container.id = 'profile-container';
    profile_container.classList.add('my-5');

    profile_view.appendChild(profile_container);
    show_posts(`username-${profile.username}`, profile_container);
  }

  profile_followers.onclick = () => {
    try {
      profile_view.removeChild(document.querySelector('#profile-container'))
    } catch (error) { }

    const profile_container = document.createElement('div');
    profile_container.id = 'profile-container';
    profile_container.classList.add('my-5');

    profile_view.appendChild(profile_container);

    show_follows(profile.username, 'get_followers', profile_container);
  }

  profile_following.onclick = () => {
    try {
      profile_view.removeChild(document.querySelector('#profile-container'))
    } catch (error) { }

    const profile_container = document.createElement('div');
    profile_container.id = 'profile-container';
    profile_container.classList.add('my-5');

    profile_view.appendChild(profile_container);

    show_follows(profile.username, 'get_followings', profile_container);
  }
}

function show_follows(username, get_follow, profile_container) {
  const follows_col = document.createElement('div');
  follows_col.classList.add('col');
  follows_col.appendChild(document.createElement('hr'));

  const csrftoken = getCookie('csrftoken');

  fetch(`/profile/${username}`, {
    headers: { 'X-CSRFToken': csrftoken },
    method: 'POST',
    body: JSON.stringify({
      "get_follow": get_follow
    })
  })
    .then(response => response.json())
    .then(follows => {
      follows.forEach(follow => {
        const follow_row = document.createElement('div');
        follow_row.classList.add('row', 'mx-1', 'p-1', 'font-weight-bold');

        follow_row.innerHTML = follow;

        follow_row.onclick = () => {
          load_profile({ "username": follow });
        }

        follows_col.appendChild(follow_row);
        follows_col.appendChild(document.createElement('hr'));
      })
    })
  profile_container.appendChild(follows_col);
}


function show_posts(page, post_view) {
  fetch(`/posts/${page}`)
    .then(response => response.json())
    .then(posts => {
      const post_card_template = document.querySelector('#post-card-template');
      post_card_template.style.display = 'block';

      if (page === 'posts_following') {
        while (post_view.childNodes.length > 1) {
          post_view.removeChild(post_view.lastChild);
        }
      }

      posts.forEach(post => {
        var clone_post_card = post_card_template.cloneNode(true);

        var clone_post_user = clone_post_card.querySelector('#post-user');
        var clone_post_timestamp = clone_post_card.querySelector('#post-timestamp');
        var clone_post_text = clone_post_card.querySelector('#post-text');
        var clone_post_text_edit = clone_post_card.querySelector('#post-text-edit');
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

        if (document.querySelector('#username').querySelector('strong').innerHTML === post.poster) {
          clone_post_text_edit.onclick = () => {
            if (clone_post_text_edit.parentNode.querySelector('#post-edit-form')) {
              clone_post_text.style.display = 'block';
              clone_post_text_edit.parentNode.removeChild(clone_post_text_edit.parentNode.querySelector('#post-edit-form'))
            } else {
              var post_edit_form = document.createElement('form');
              post_edit_form.id = 'post-edit-form';

              var post_edit_form_group = document.createElement('div');
              post_edit_form_group.classList.add('form-group');

              var post_edit_form_group_textarea = document.createElement('textarea');
              post_edit_form_group_textarea.id = 'post-edit-text';
              post_edit_form_group_textarea.classList.add('form-control');
              post_edit_form_group_textarea.rows = "5";
              post_edit_form_group_textarea.value = post.text;
              post_edit_form_group_textarea.required = true;
              post_edit_form_group.appendChild(post_edit_form_group_textarea);

              var post_edit_form_button_div = document.createElement('div');
              post_edit_form_button_div.classList.add('d-flex', 'justify-content-end');

              var post_edit_form_button = document.createElement('button');
              post_edit_form_button.classList.add('btn', 'btn-success', 'btn-sm');

              post_edit_form_button.innerHTML = 'Save';
              post_edit_form_button_div.appendChild(post_edit_form_button);

              post_edit_form.appendChild(post_edit_form_group);
              post_edit_form.appendChild(post_edit_form_button_div);
              clone_post_text_edit.parentNode.appendChild(post_edit_form);

              clone_post_text.style.display = 'none';

              post_edit_form.onsubmit = () => {
                fetch(`/posts/${post.id}`, {
                  headers: { 'X-CSRFToken': csrftoken },
                  method: 'PUT',
                  body: JSON.stringify({
                    'text': post_edit_form_group_textarea.value
                  })
                })
                  .then(response => response.json())
                  .then(result => { })
              };
            }
          }
        } else {
          try {
            clone_post_text_edit.parentNode.removeChild(clone_post_text_edit)
          } catch (error) { }
        }

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
              load_profile(profile);
            })
        }

        clone_post_comments.onclick = () => {
          if (clone_post_comment_form.style.display === 'none') {
            clone_post_comments.classList.add('shadow-sm');
            clone_post_comment_form.style.display = 'block';
            clone_post_all_comments.style.display = 'block';

            clone_post_comment_form.querySelector('#compose-form').onsubmit = () => {
              fetch(`/posts/${post.id}`, {
                headers: { 'X-CSRFToken': csrftoken },
                method: 'PUT',
                body: JSON.stringify({
                  'comment': clone_post_comment_form.querySelector('#comment-text').value
                })
              })
                .then(response => response.json())
                .then(result => {
                  try {
                    clone_post_all_comments.removeChild(document.querySelector('#comments_col'));
                  } catch (error) { }
                  show_comments();
                  clone_post_comment_form.querySelector('#comment-text').value = '';
                })
              return false;
            }

            show_comments();

            function show_comments() {
              fetch(`/posts/${post.id}`)
                .then(response => response.json())
                .then(post_contents => {

                  // show comments
                  const comments_col = document.createElement('div');
                  comments_col.classList.add('col');
                  comments_col.id = 'comments_col';
                  comments_col.appendChild(document.createElement('hr'));

                  post_contents.all_comments.reverse().forEach(comment => {
                    var comment_col = document.createElement('div');
                    comment_col.classList.add('col', 'shadow-sm');

                    var comment_commentor = document.createElement('div');
                    comment_commentor.classList.add('row', 'mx-0', 'font-weight-bold');
                    comment_commentor.innerHTML = comment.username;

                    var comment_row_text = document.createElement('p');
                    comment_row_text.innerHTML = comment.text.replace(/\n/g, '<br>');

                    var comment_row_timestamp = document.createElement('div');
                    comment_row_timestamp.classList.add('d-flex', 'justify-content-end', 'text-secondary', 'small');
                    comment_row_timestamp.innerHTML = Date(comment.timestamp);

                    comment_col.appendChild(comment_commentor);
                    comment_col.appendChild(comment_row_text);
                    comment_col.appendChild(comment_row_timestamp);

                    comments_col.appendChild(comment_col);
                  })
                  clone_post_all_comments.appendChild(comments_col);
                  clone_post_comments.innerHTML = `Comments ${post_contents.comments}`;
                })
            }
          }
          else {
            clone_post_comments.classList.remove('shadow-sm');
            clone_post_comment_form.style.display = 'none';
            clone_post_all_comments.removeChild(document.querySelector('#comments_col'));
          }
        }
      })
      post_card_template.style.display = 'none';
    })
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