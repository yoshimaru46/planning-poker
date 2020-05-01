import React from 'react';
import firebase from "./Firebase";

const Home = () => {

  const loginWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      const user = result.user;
      console.log('user', user)
    }).catch((error: any) => {
      console.error(error)
    });
  }

  return (
    <div>
      <h2>Home</h2>
      <button onClick={loginWithGithub}>
        Login with Github
      </button>
    </div>
  );
}

export default Home;
