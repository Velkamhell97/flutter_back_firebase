function handleCredentialResponse(response) {
  const body = {
    id_token : response.credential
  }

  const url = window.location.hostname.includes('localhost')
  ? 'http://localhost:8080/api/auth/google'
  : 'https://flutter-chat-back.herokuapp.com/api/auth/google'

  fetch(url, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then((resp) => resp.json())
  .then((resp) => {
    
    if(resp.error){
      localStorage.setItem('email', resp.email);
      signout()
      return;
    }

    localStorage.setItem('email', resp.user.email);
    location.reload();
  }).catch((error) => {
    console.log(error);
  })
}

const button = document.querySelector("#google_signout");

button.addEventListener("click", () => {
  if(!localStorage.getItem('email')){
    console.log('User not logged');
  } else {
    signout();
  }
});

function signout(e) {
  google.accounts.id.disableAutoSelect();

  google.accounts.id.revoke(localStorage.getItem('email'), done => {
    localStorage.clear();
    location.reload();
  });
}